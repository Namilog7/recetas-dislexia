from google import genai

from app.db.database import settings
from app.schemas.recipe import RecipeAIResponse


class RecipeProcessor:

    @staticmethod
    def process(text: str) -> RecipeAIResponse:
        client = genai.Client(
            api_key=settings.gemini_api_key
        )

        prompt = f"""
        Sos un asistente especializado en estructurar recetas de cocina.

        El usuario puede escribir una receta de manera informal,
        desordenada, con errores ortográficos o sin una estructura definida.

        Tu tarea es interpretar el texto y convertirlo en una receta
        estructurada.

        Reglas importantes:

        - No inventes ingredientes.
        - No inventes cantidades.
        - No inventes tiempos.
        - No inventes cantidades de porciones.
        - Si un dato no está presente, devolvé null.
        - Conservá la intención original del usuario.
        - Podés corregir errores ortográficos.
        - Podés reorganizar la información para hacerla más clara.
        - Separá correctamente ingredientes y pasos.
        - Los pasos deben estar ordenados.
        - Los consejos deben ir en "tips".
        - El título debe ser descriptivo y breve.

        Receta escrita por el usuario:

        {text}
        """

        interaction = client.interactions.create(
            model="gemini-3.6-flash",
            input=prompt,
            response_format={
                "type": "text",
                "mime_type": "application/json",
                "schema": RecipeAIResponse.model_json_schema(),
            },
        )

        return RecipeAIResponse.model_validate_json(
            interaction.output_text
        )