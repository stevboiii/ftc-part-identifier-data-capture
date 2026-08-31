import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No image file provided." },
        { status: 400 }
      );
    }

    const roboflowForm = new FormData();

    roboflowForm.append("name", file.name);
    roboflowForm.append("file", file);
    roboflowForm.append("split", "train");

    const apiKey = process.env.ROBOFLOW_API_KEY;

    if (!apiKey) {
      console.error("ROBOFLOW_API_KEY is not defined.");
      return NextResponse.json(
        { error: "Roboflow API key is not configured." },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://api.roboflow.com/dataset/ftc-official-parts/upload?api_key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        body: roboflowForm,
      }
    );

    const responseText = await response.text();

    console.log("Roboflow status:", response.status);
    console.log("Roboflow response:", responseText);

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Roboflow returned ${response.status}: ${responseText}`,
        },
        { status: response.status }
      );
    }

    let data;

    try {
      data = JSON.parse(responseText);
    } catch {
      data = { response: responseText };
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Upload route error:", error);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}