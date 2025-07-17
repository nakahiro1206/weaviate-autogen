# Dependency Injection Guide

This guide explains how to implement and use dependency injection in your AutoGen backend application.

## What is Dependency Injection?

Dependency Injection (DI) is a design pattern that implements Inversion of Control (IoC) for managing dependencies. Instead of creating dependencies inside a class, they are "injected" from the outside.

## Why Use Dependency Injection?

### Problems with the Original Code

Looking at your original `server.py`, you had several issues:

1. **Hard-coded dependencies** - Services were created directly in functions
2. **Tight coupling** - Components were directly dependent on concrete implementations
3. **Difficult testing** - Hard to mock external dependencies
4. **Configuration scattered** - File paths and settings were hard-coded

### Benefits of Dependency Injection

1. **Testability** - Easy to inject mock implementations
2. **Flexibility** - Easy to swap implementations
3. **Maintainability** - Clear separation of concerns
4. **Configuration** - Centralized dependency management

## Implementation Overview

### 1. Interfaces (`di/interfaces.py`)

Define contracts that implementations must follow:

```python
from abc import ABC, abstractmethod

class ITeamRepository(ABC):
    @abstractmethod
    async def get_team(self, user_input_func, state=None) -> RoundRobinGroupChat:
        pass
```

### 2. Implementations (`di/implementations.py`)

Concrete classes that implement the interfaces:

```python
class TeamRepository(ITeamRepository):
    def __init__(self, model_client_provider: IModelClientProvider):
        self.model_client_provider = model_client_provider

    async def get_team(self, user_input_func, state=None) -> RoundRobinGroupChat:
        model_client = await self.model_client_provider.get_model_client()
        # ... team creation logic
```

### 3. Container (`di/__init__.py`)

Manages dependency registration and resolution:

```python
container = DependencyContainer()
container.register_singleton(ITeamRepository, lambda c: TeamRepository(...))
team_repo = container.resolve(ITeamRepository)
```

### 4. Setup (`di/setup.py`)

Configures the dependency injection container:

```python
def setup_dependencies():
    container.register_singleton(IConfigurationProvider, ConfigurationProvider)
    container.register_singleton(IModelClientProvider, ModelClientProvider)
    # ... more registrations
```

## How to Use

### Basic Usage

```python
from di.setup import setup_dependencies, get_container
from di.interfaces import ITeamRepository

# Setup dependencies
setup_dependencies()

# Get container and resolve dependencies
container = get_container()
team_repo = container.resolve(ITeamRepository)

# Use the resolved dependency
team = await team_repo.get_team(user_input_func)
```

### Creating a New Service

1. **Define the interface**:

```python
# di/interfaces.py
class IMyService(ABC):
    @abstractmethod
    async def do_something(self, data: str) -> str:
        pass
```

2. **Create the implementation**:

```python
# di/implementations.py
class MyService(IMyService):
    def __init__(self, dependency: IOtherService):
        self.dependency = dependency

    async def do_something(self, data: str) -> str:
        result = await self.dependency.process(data)
        return f"Processed: {result}"
```

3. **Register in setup**:

```python
# di/setup.py
def setup_dependencies():
    # ... existing registrations
    container.register_singleton(IMyService, lambda c: MyService(
        dependency=c.resolve(IOtherService)
    ))
```

4. **Use in your code**:

```python
container = get_container()
my_service = container.resolve(IMyService)
result = await my_service.do_something("test data")
```

## Testing with Dependency Injection

### Before (Hard to test)

```python
async def get_team_old(user_input_func):
    # Hard to test - requires real file system and model client
    async with aiofiles.open("model_config.yaml", "r") as file:
        model_config = yaml.safe_load(await file.read())
    model_client = ChatCompletionClient.load_component(model_config)
    # ... rest of implementation
```

### After (Easy to test)

```python
class TeamRepository(ITeamRepository):
    def __init__(self, model_client_provider: IModelClientProvider):
        self.model_client_provider = model_client_provider

    async def get_team(self, user_input_func):
        model_client = await self.model_client_provider.get_model_client()
        # ... rest of implementation

# In tests:
mock_provider = MagicMock(spec=IModelClientProvider)
mock_provider.get_model_client.return_value = mock_client
team_repo = TeamRepository(mock_provider)
```

## Migration Strategy

### Step 1: Identify Dependencies

Look for:

- Direct instantiation of classes
- Hard-coded file paths
- External service calls
- Configuration loading

### Step 2: Create Interfaces

For each dependency, create an interface:

```python
class IConfigurationProvider(ABC):
    @abstractmethod
    async def get_model_config(self) -> Dict[str, Any]:
        pass
```

### Step 3: Create Implementations

Move the concrete logic to implementation classes:

```python
class ConfigurationProvider(IConfigurationProvider):
    async def get_model_config(self) -> Dict[str, Any]:
        async with aiofiles.open("model_config.yaml", "r") as file:
            return yaml.safe_load(await file.read())
```

### Step 4: Update Services

Replace direct instantiation with dependency injection:

```python
# Before
async def get_team(user_input_func):
    async with aiofiles.open("model_config.yaml", "r") as file:
        model_config = yaml.safe_load(await file.read())
    # ...

# After
class TeamRepository(ITeamRepository):
    def __init__(self, config_provider: IConfigurationProvider):
        self.config_provider = config_provider

    async def get_team(self, user_input_func):
        model_config = await self.config_provider.get_model_config()
        # ...
```

### Step 5: Register Dependencies

Set up the container:

```python
def setup_dependencies():
    container.register_singleton(IConfigurationProvider, ConfigurationProvider)
    container.register_singleton(ITeamRepository, lambda c: TeamRepository(
        config_provider=c.resolve(IConfigurationProvider)
    ))
```

## Best Practices

### 1. Always Use Interfaces

```python
# Good
def __init__(self, repo: ITeamRepository):
    self.repo = repo

# Bad
def __init__(self, repo: TeamRepository):
    self.repo = repo
```

### 2. Keep Services Focused

```python
# Good - single responsibility
class TeamRepository(ITeamRepository):
    async def get_team(self, user_input_func):
        # Only team-related logic

# Bad - multiple responsibilities
class TeamRepository(ITeamRepository):
    async def get_team(self, user_input_func):
        # Team logic + file I/O + configuration + logging
```

### 3. Use Appropriate Registration Types

```python
# Singleton - for expensive resources
container.register_singleton(IDatabaseConnection, DatabaseConnection)

# Factory - for objects that need different configs
container.register_factory(ILogger, lambda c: Logger(c.resolve(IConfig)))

# Direct - for simple objects
container.register(ISimpleService, SimpleService())
```

### 4. Test with Mocks

```python
def test_my_service():
    # Create test container
    container = DependencyContainer()

    # Register mocks
    mock_repo = MagicMock(spec=ITeamRepository)
    container.register(ITeamRepository, mock_repo)

    # Test with mocked dependencies
    service = MyService(container.resolve(ITeamRepository))
    result = service.do_something()

    # Verify interactions
    mock_repo.get_team.assert_called_once()
```

## Running the New Server

The new DI-enabled server is in `server_di.py`:

```bash
# Run the DI-enabled server
python server_di.py

# The original server still works
python server.py
```

## Examples

See the following files for complete examples:

- `examples/di_migration_example.py` - Migration from old to new approach
- `tests/test_di.py` - Testing examples
- `server_di.py` - Complete DI-enabled server

## Troubleshooting

### Common Issues

1. **Circular Dependencies**

   - Use lazy loading or restructure dependencies

2. **Missing Registrations**

   - Check that all dependencies are registered in `setup.py`

3. **Type Errors**

   - Ensure implementations properly inherit from interfaces

4. **Configuration Issues**
   - Verify configuration files exist and are accessible

### Debug Tips

1. Enable debug logging to see dependency resolution
2. Use `container.get()` for safe resolution
3. Check the container state with `print(container._services)`

## Next Steps

1. **Gradual Migration** - Start with one service at a time
2. **Add Tests** - Create comprehensive test coverage
3. **Configuration** - Move hard-coded values to configuration
4. **Documentation** - Document all interfaces and their purposes
5. **Performance** - Monitor and optimize dependency resolution
