from . import container
from .interfaces import (
    IModelClientProvider, 
    ITeamRepository, 
    IHistoryRepository, 
    IConfigurationProvider
)
from .implementations import (
    ModelClientProvider,
    TeamRepository,
    HistoryRepository,
    ConfigurationProvider
)

def setup_dependencies() -> None:
    """Setup all dependencies in the container"""
    
    # Register configuration provider as singleton
    container.register_singleton(
        IConfigurationProvider,
        lambda container: ConfigurationProvider()
    )
    
    # Register model client provider as singleton
    container.register_singleton(
        IModelClientProvider,
        lambda container: ModelClientProvider(
            config_provider=container.resolve(IConfigurationProvider)
        )
    )
    
    # Register history repository as singleton
    container.register_singleton(
        IHistoryRepository,
        lambda container: HistoryRepository(
            config_provider=container.resolve(IConfigurationProvider)
        )
    )
    
    # Register team repository as singleton
    container.register_singleton(
        ITeamRepository,
        lambda container: TeamRepository(
            model_client_provider=container.resolve(IModelClientProvider),
            config_provider=container.resolve(IConfigurationProvider)
        )
    )

def get_container():
    """Get the configured dependency container"""
    return container 