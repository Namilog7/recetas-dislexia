from pydantic import BaseModel, Field


class RecipeCreate(BaseModel):
    title: str
    description: str | None = None
    original_text: str
    preparation_time: str | None = None
    servings: int | None = None
    ingredients: list[str]
    steps: list[str]
    tips: list[str] | None = None


class RecipeResponse(BaseModel):
    id: str
    user_id: str
    title: str
    description: str | None
    original_text: str
    preparation_time: str | None
    servings: int | None
    ingredients: list[str]
    steps: list[str]
    tips: list[str] | None
    image_url: str | None
    puntaje: float | None

    class Config:
        from_attributes = True

class RecipeUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    original_text: str | None = None
    preparation_time: str | None = None
    servings: int | None = None
    ingredients: list[str] | None = None
    steps: list[str] | None = None
    tips: list[str] | None = None        


class RecipeProcessRequest(BaseModel):
    text: str    

class RecipeAIResponse(BaseModel):
    title: str
    description: str | None = None
    preparation_time: str | None = None
    servings: int | None = None
    ingredients: list[str]
    steps: list[str]
    tips: list[str] | None = None


class RecipeListResponse(BaseModel):
    items: list[RecipeResponse]
    total: int
    skip: int
    limit: int


class PuntajeCreate(BaseModel):
    puntaje: float = Field(ge=1.0, le=5.0)


class PuntajeResponse(BaseModel):
    puntaje: float | None
    mi_puntaje: float | None