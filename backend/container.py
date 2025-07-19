# container for all the adapters

from adapter.storage import StorageRepositoryImpl
from adapter.team import TeamRepositoryImpl

class Container:
    def __init__(self):
        self.storage_repository = StorageRepositoryImpl()
        self.team_repository = TeamRepositoryImpl()

    def get_storage_repository(self):
        return self.storage_repository