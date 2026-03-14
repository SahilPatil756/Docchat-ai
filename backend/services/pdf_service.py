import os
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import FAISS

VECTOR_STORE_PATH = "vector_store/faiss_index"

def process_pdf(file_path: str):
    print(f"Loading PDF: {file_path}")
    loader = PyPDFLoader(file_path)
    documents = loader.load()
    
    print(f"Chunking document (Total Pages: {len(documents)})")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
    )
    chunks = text_splitter.split_documents(documents)
    
    print(f"Generating embeddings and storing {len(chunks)} chunks in FAISS...")
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    
    # Check if vector store already exists to append, or create new
    if os.path.exists(VECTOR_STORE_PATH):
        vector_store = FAISS.load_local(VECTOR_STORE_PATH, embeddings, allow_dangerous_deserialization=True)
        vector_store.add_documents(chunks)
    else:
        vector_store = FAISS.from_documents(chunks, embeddings)
        
    vector_store.save_local(VECTOR_STORE_PATH)
    print("Vector storing complete.")
    
    return len(chunks)
