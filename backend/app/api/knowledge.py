
from pathlib import Path

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    HTTPException,
    Depends,
)

from app.services.auth_dependency import (
    get_current_user
)

from app.models.user import User

from app.services.rag_service import (
    process_single_file,
    delete_document_from_vector_store
)


router = APIRouter(
    prefix="/api/knowledge",
    tags=["Knowledge Base"]
)


BASE_DIR = Path(__file__).resolve().parents[2]

KNOWLEDGE_BASE_DIR = (
    BASE_DIR / "knowledge_base"
)


SUPPORTED_EXTENSIONS = {
    ".pdf",
    ".docx",
    ".txt",
    ".csv",
    ".md",
}


MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(
        get_current_user
    )
):

    # -----------------------------------------
    # 1. Check filename
    # -----------------------------------------

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="No filename provided."
        )


    # -----------------------------------------
    # 2. Check file extension
    # -----------------------------------------

    extension = Path(
        file.filename
    ).suffix.lower()


    if extension not in SUPPORTED_EXTENSIONS:

        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported file format. "
                "Supported formats: PDF, DOCX, "
                "TXT, CSV, MD."
            )
        )


    # -----------------------------------------
    # 3. Read file
    # -----------------------------------------

    contents = await file.read()


    # -----------------------------------------
    # 4. Check file size
    # -----------------------------------------

    if len(contents) > MAX_FILE_SIZE:

        raise HTTPException(
            status_code=400,
            detail="File size cannot exceed 10 MB."
        )


    # -----------------------------------------
    # 5. Create knowledge directory
    # -----------------------------------------

    KNOWLEDGE_BASE_DIR.mkdir(
        parents=True,
        exist_ok=True
    )


    # -----------------------------------------
    # 6. Create file path
    # -----------------------------------------

    file_path = (
        KNOWLEDGE_BASE_DIR
        / file.filename
    )


    # -----------------------------------------
    # 7. Save file
    # -----------------------------------------

    with file_path.open("wb") as buffer:

        buffer.write(contents)


    # -----------------------------------------
    # 8. Process document
    # -----------------------------------------

    try:

        chunks = process_single_file(
            file_path
        )

    except Exception as e:

        file_path.unlink(
            missing_ok=True
        )

        raise HTTPException(
             status_code=409,
              detail=str(e)
        )


    # -----------------------------------------
    # 9. Return response
    # -----------------------------------------

    return {
        "message": (
            "Document uploaded and "
            "processed successfully"
        ),
        "filename": file.filename,
        "chunks": chunks
    }

@router.get("/documents")
async def list_documents(
    current_user: User = Depends(
        get_current_user
    )
):

    if not KNOWLEDGE_BASE_DIR.exists():

        return {
            "documents": []
        }


    documents = []


    for file_path in KNOWLEDGE_BASE_DIR.iterdir():

        if not file_path.is_file():
            continue


        if (
            file_path.suffix.lower()
            not in SUPPORTED_EXTENSIONS
        ):
            continue


        documents.append(
            {
                "filename": file_path.name,
                "file_type": file_path.suffix.lower(),
                "size": file_path.stat().st_size,
            }
        )


    return {
        "documents": documents
    }




@router.delete("/documents/{filename}")
async def delete_document(
    filename: str,
    current_user: User = Depends(
        get_current_user
    )
):

    file_path = (
        KNOWLEDGE_BASE_DIR
        / filename
    )


    if not file_path.exists():

        raise HTTPException(
            status_code=404,
            detail="Document not found."
        )


    if (
        file_path.suffix.lower()
        not in SUPPORTED_EXTENSIONS
    ):

        raise HTTPException(
            status_code=400,
            detail="Unsupported document."
        )


    try:

        deleted_chunks = (
            delete_document_from_vector_store(
                filename
            )
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=(
                f"Failed to remove document "
                f"from vector database: {e}"
            )
        )


    file_path.unlink()


    return {
        "message": (
            "Document deleted successfully."
        ),
        "filename": filename,
        "deleted_chunks": deleted_chunks
    }








#old code saving large files
# from pathlib import Path
# import shutil

# from fastapi import (
#     APIRouter,
#     UploadFile,
#     File,
#     HTTPException,
#     Depends,
# )

# from app.services.auth_dependency import (
#     get_current_user
# )

# from app.models.user import User

# from app.services.rag_service import (
#     process_single_file
# )


# router = APIRouter(
#     prefix="/api/knowledge",
#     tags=["Knowledge Base"]
# )


# BASE_DIR = Path(__file__).resolve().parents[2]

# KNOWLEDGE_BASE_DIR = (
#     BASE_DIR / "knowledge_base"
# )


# SUPPORTED_EXTENSIONS = {
#     ".pdf",
#     ".docx",
#     ".txt",
#     ".csv",
#     ".md",
# }
# MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

# @router.post("/upload")
# async def upload_document(
#     file: UploadFile = File(...),
#     current_user: User = Depends(
#         get_current_user
#     )
# ):

#     extension = Path(
#         file.filename
#     ).suffix.lower()

#     if extension not in SUPPORTED_EXTENSIONS:

#         raise HTTPException(
#             status_code=400,
#             detail=(
#                 "Unsupported file format. "
#                 "Supported formats: PDF, DOCX, "
#                 "TXT, CSV, MD."
#             )
#         )

#     KNOWLEDGE_BASE_DIR.mkdir(
#         parents=True,
#         exist_ok=True
#     )

#     file_path = (
#         KNOWLEDGE_BASE_DIR
#         / file.filename
#     )

    
#     # with file_path.open("wb") as buffer:

#     #     shutil.copyfileobj(
#     #         file.file,
#     #         buffer
#     #     )
#     contents = await file.read()

#     if len(contents) > MAX_FILE_SIZE:

#      raise HTTPException(
#         status_code=400,
#         detail="File size cannot exceed 10 MB."
#     )

#     with file_path.open("wb") as buffer:

#      buffer.write(contents)

#     return {
#         "message": "File uploaded successfully",
#         "filename": file.filename
#     }


# @router.post("/upload")
# async def upload_document(
#     file: UploadFile = File(...),
#     current_user: User = Depends(
#         get_current_user
#     )
# ):

#     extension = Path(
#         file.filename
#     ).suffix.lower()

#     if extension not in SUPPORTED_EXTENSIONS:

#         raise HTTPException(
#             status_code=400,
#             detail=(
#                 "Unsupported file format. "
#                 "Supported formats: PDF, DOCX, "
#                 "TXT, CSV, MD."
#             )
#         )

#     KNOWLEDGE_BASE_DIR.mkdir(
#         parents=True,
#         exist_ok=True
#     )

#     file_path = (
#         KNOWLEDGE_BASE_DIR
#         / file.filename
#     )

#     with file_path.open("wb") as buffer:

#         shutil.copyfileobj(
#             file.file,
#             buffer
#         )

#     try:

#         chunks = process_single_file(
#             file_path
#         )

#     except Exception as e:

#         file_path.unlink(
#             missing_ok=True
#         )

#         raise HTTPException(
#             status_code=500,
#             detail=(
#                 f"Failed to process document: {e}"
#             )
#         )

#     return {
#         "message": (
#             "Document uploaded and "
#             "processed successfully"
#         ),
#         "filename": file.filename,
#         "chunks": chunks
#     }


# #rm -rf chroma_db -> when you do changes and want to restart