const API_URL = "http://127.0.0.1:8000";


export async function uploadDocument(file) {

  const token =
    localStorage.getItem("access_token");


  if (!token) {

    throw new Error(
      "You are not authenticated. Please login first."
    );

  }


  const formData = new FormData();

  formData.append(
    "file",
    file
  );


  const response = await fetch(
    `${API_URL}/api/knowledge/upload`,
    {
      method: "POST",

      headers: {
        Authorization: `Bearer ${token}`,
      },

      body: formData,
    }
  );


  const data =
    await response.json();


  if (!response.ok) {

    throw new Error(
      data.detail ||
      "Failed to upload document"
    );

  }


  return data;
}

export async function getDocuments() {

    const token =
        localStorage.getItem(
            "access_token"
        );


    const response = await fetch(
        `${API_URL}/api/knowledge/documents`,
        {
            method: "GET",

            headers: {
                Authorization:
                    `Bearer ${token}`,
            },
        }
    );


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(
            data.detail ||
            "Failed to fetch documents"
        );
    }


    return data.documents;
}


export async function deleteDocument(
    filename
) {

    const token =
        localStorage.getItem(
            "access_token"
        );


    const response = await fetch(
        `${API_URL}/api/knowledge/documents/${encodeURIComponent(filename)}`,
        {
            method: "DELETE",

            headers: {
                Authorization:
                    `Bearer ${token}`,
            },
        }
    );


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(
            data.detail ||
            "Failed to delete document"
        );
    }


    return data;
}

