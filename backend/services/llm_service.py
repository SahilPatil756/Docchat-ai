import os
import json
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains import create_retrieval_chain
from langchain_core.prompts import ChatPromptTemplate

VECTOR_STORE_PATH = "vector_store/faiss_index"

def get_vector_store():
    if not os.path.exists(VECTOR_STORE_PATH):
        raise ValueError("Documents not processed yet. Please upload a PDF first.")
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    return FAISS.load_local(VECTOR_STORE_PATH, embeddings, allow_dangerous_deserialization=True)

def chat_with_doc(query: str):
    vector_store = get_vector_store()
    retriever = vector_store.as_retriever(search_kwargs={"k": 5})
    
    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0)
    
    system_prompt = (
        "You are an AI assistant for a document. Answer the user's question based ONLY on the following context. "
        "If the answer is not in the context, say 'I cannot find the answer in the provided document.'\n\n"
        "Context:\n{context}"
    )
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{input}"),
    ])
    
    question_answer_chain = create_stuff_documents_chain(llm, prompt)
    chain = create_retrieval_chain(retriever, question_answer_chain)
    
    response = chain.invoke({"input": query})
    
    sources = []
    for doc in response.get("context", []):
        sources.append({
            "page": doc.metadata.get("page", "Unknown"),
            "content": doc.page_content[:200] + "..."
        })
        
    return {
        "answer": response["answer"],
        "sources": sources
    }

def summarize_doc():
    vector_store = get_vector_store()
    # For MVP, we retrieve the top chunks that cover general topics, or just retrieve up to context limit
    retriever = vector_store.as_retriever(search_kwargs={"k": 20})
    documents = retriever.invoke("Provide a comprehensive overview of the main topics in this document.")
    
    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0.2)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert summarizer. Summarize the key points, main arguments, and important facts from the provided context in a well-structured markdown format.\n\nContext:\n{context}"),
        ("human", "Please summarize the document."),
    ])
    
    chain = create_stuff_documents_chain(llm, prompt)
    response = chain.invoke({"context": documents})
    return response

def generate_quiz():
    vector_store = get_vector_store()
    retriever = vector_store.as_retriever(search_kwargs={"k": 10})
    documents = retriever.invoke("Key facts and definitions")
    
    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0.7)
    
    system_prompt = (
        "Generate a 5-question multiple choice quiz based on the provided document context. "
        "Return the output STRICTLY in the following JSON array format, and no other text or explanation:\n"
        "[\n"
        "  {\n"
        "    \"question\": \"Question text\",\n"
        "    \"options\": [\"A. Option 1\", \"B. Option 2\", \"C. Option 3\", \"D. Option 4\"],\n"
        "    \"answer\": \"B. Option 2\"\n"
        "  }\n"
        "]\n\nContext:\n{context}"
    )
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "Generate the quiz now."),
    ])
    
    chain = create_stuff_documents_chain(llm, prompt)
    response = chain.invoke({"context": documents})
    
    # Try parsing JSON safely
    try:
        # Strip code blocks if present
        text = response.strip()
        if text.startswith("```json"):
            text = text[7:-3].strip()
        quiz_data = json.loads(text)
        return quiz_data
    except Exception as e:
        print(f"Error parsing quiz JSON: {e}\nRaw output: {response}")
        return {"error": "Failed to parse quiz format from LLM."}
