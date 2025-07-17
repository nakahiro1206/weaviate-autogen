from abc import ABC, abstractmethod
from typing import Any, Dict, Type, TypeVar, Optional, Callable
import logging

logger = logging.getLogger(__name__)

T = TypeVar('T')

class DependencyContainer:
    """Simple dependency injection container"""
    
    def __init__(self):
        self._services: Dict[Type, Any] = {}
        self._factories: Dict[Type, Callable[['DependencyContainer'], Any]] = {}
        self._singletons: Dict[Type, Any] = {}
    
    def register(self, interface: Type[T], implementation: T) -> None:
        """Register a concrete implementation for an interface"""
        self._services[interface] = implementation
        logger.debug(f"Registered {interface.__name__} -> {type(implementation).__name__}")
    
    def register_factory(self, interface: Type[T], factory: Callable[['DependencyContainer'], T]) -> None:
        """Register a factory function for creating instances"""
        self._factories[interface] = factory
        logger.debug(f"Registered factory for {interface.__name__}")
    
    def register_singleton(self, interface: Type[T], factory: Callable[['DependencyContainer'], T]) -> None:
        """Register a singleton factory that creates only one instance"""
        self._factories[interface] = factory
        logger.debug(f"Registered singleton factory for {interface.__name__}")
    
    def resolve(self, interface: Type[T]) -> T:
        """Resolve a dependency by its interface type"""
        # Check if we have a direct implementation
        if interface in self._services:
            return self._services[interface]
        
        # Check if we have a singleton instance
        if interface in self._singletons:
            return self._singletons[interface]
        
        # Check if we have a factory
        if interface in self._factories:
            factory = self._factories[interface]
            instance = factory(self)
            
            # If it's a singleton factory, cache the instance
            if interface in self._factories:
                self._singletons[interface] = instance
            
            return instance
        
        raise KeyError(f"No implementation registered for {interface.__name__}")
    
    def get(self, interface: Type[T]) -> Optional[T]:
        """Safely get a dependency, returns None if not found"""
        try:
            return self.resolve(interface)
        except KeyError:
            return None

# Global container instance
container = DependencyContainer() 