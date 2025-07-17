from typing import Any
import aiofiles
import yaml

model_config_path = "model_config.yaml"

async def load_model_config() -> Any:
    async with aiofiles.open(model_config_path, "r") as file:
        model_config = yaml.safe_load(await file.read())
        return model_config