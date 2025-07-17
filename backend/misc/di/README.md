# Dependency Injection System

This module provides a comprehensive dependency injection system for the AutoGen backend application.

## Overview

The dependency injection system consists of:

1. **Interfaces** (`interfaces.py`) - Abstract base classes defining contracts
2. **Implementations** (`implementations.py`) - Concrete implementations of interfaces
3. **Container** (`__init__.py`) - Dependency injection container
4. **Setup** (`setup.py`) - Configuration and registration of dependencies
5. **Services** (`chat_service.py`) - Business logic using injected dependencies

## Key Benefits

### 1. **Testability**

- Easy to mock dependencies for unit testing
- Isolated testing of business logic
- No need to set up real external services for tests

### 2. **Flexibility**

- Easy to swap implementations
- Configuration-driven behavior
- Support for different environments (dev, test, prod)

### 3. **Maintainability**

- Clear separation of concerns
- Loose coupling between components
- Easy to understand dependencies

## Usage

### Basic Setup

```python
from di.setup import setup_dependencies, get_container
from di.interfaces import ITeamRepository, IHistoryRepository

# Setup dependencies
setup_dependencies()

# Get container and resolve dependencies
container = get_container()
team_repo = container.resolve(ITeamRepository)
history_repo = container.resolve(IHistoryRepository)
```

### Creating a Service

```python
from di.interfaces import ITeamRepository, IHistoryRepository

class MyService:
    def __init__(self, team_repo: ITeamRepository, history_repo: IHistoryRepository):
        self.team_repo = team_repo
        self.history_repo = history_repo

    async def do_something(self):
        # Use injected dependencies
        team = await self.team_repo.get_team(user_input_func)
        history = await self.history_repo.load_history()
```

### Testing with Mocks

```python
from unittest.mock import MagicMock
from di.container import DependencyContainer
from di.interfaces import ITeamRepository

# Create test container
container = DependencyContainer()

# Register mock implementation
mock_team_repo = MagicMock(spec=ITeamRepository)
container.register(ITeamRepository, mock_team_repo)

# Use in tests
team_repo = container.resolve(ITeamRepository)
assert isinstance(team_repo, MagicMock)
```

## Available Interfaces

### IModelClientProvider

Provides access to the AI model client.

```python
async def get_model_client(self) -> ChatCompletionClient
async def close(self) -> None
```

### ITeamRepository

Manages AutoGen team creation and state.

```python
async def get_team(self, user_input_func, state=None) -> RoundRobinGroupChat
async def save_team_state(self, team) -> Dict[str, Any]
async def load_team_state(self, team, state) -> None
```

### IHistoryRepository

Manages conversation history.

```python
async def load_history(self) -> List[Dict[str, Any]]
async def save_history(self, history) -> None
async def append_message(self, message) -> None
async def get_history(self) -> List[Dict[str, Any]]
```

### IConfigurationProvider

Provides configuration values.

```python
async def get_model_config(self) -> Dict[str, Any]
async def get_state_path(self) -> str
async def get_history_path(self) -> str
```

## Container Features

### Registration Types

1. **Direct Registration**

   ```python
   container.register(IMyInterface, MyImplementation())
   ```

2. **Factory Registration**

   ```python
   container.register_factory(IMyInterface, lambda container: MyImplementation())
   ```

3. **Singleton Registration**
   ```python
   container.register_singleton(IMyInterface, lambda container: MyImplementation())
   ```

### Resolution

```python
# Resolve dependency
service = container.resolve(IMyInterface)

# Safe resolution (returns None if not found)
service = container.get(IMyInterface)
```

## Migration from Original Code

### Before (Hard-coded dependencies)

```python
async def get_team(user_input_func):
    async with aiofiles.open("model_config.yaml", "r") as file:
        model_config = yaml.safe_load(await file.read())
    model_client = ChatCompletionClient.load_component(model_config)
    # ... hard-coded team creation
```

### After (Dependency injection)

```python
class TeamRepository(ITeamRepository):
    def __init__(self, model_client_provider: IModelClientProvider):
        self.model_client_provider = model_client_provider

    async def get_team(self, user_input_func):
        model_client = await self.model_client_provider.get_model_client()
        # ... team creation using injected client
```

## Running the DI-enabled Server

```bash
# Run the new DI-enabled server
python server_di.py

# Or use the original server (still works)
python server.py
```

## Testing

Install pytest and run tests:

```bash
pip install pytest pytest-asyncio
pytest tests/test_di.py -v
```

## Best Practices

1. **Always use interfaces** - Never depend on concrete implementations
2. **Keep services focused** - Each service should have a single responsibility
3. **Use dependency injection** - Don't create dependencies inside services
4. **Test with mocks** - Use the container to inject mock implementations
5. **Register as singletons** - For expensive resources like database connections
6. **Use factories** - For objects that need different configurations
