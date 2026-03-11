from flask_sqlalchemy import SQLAlchemy
from langchain_google_genai import ChatGoogleGenerativeAI


db = SQLAlchemy()


def build_llm(api_key: str | None):
    if not api_key:
        return None

    return ChatGoogleGenerativeAI(
        model='gemini-2.5-flash',
        google_api_key=api_key,
        temperature=0.7,
    )
