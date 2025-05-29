async function getPredictedLabel(landmarks) {
  try {
    // Flatten the landmarks array into an object matching the FastAPI Pydantic model
    // Each landmark is an object {x, y, z} (if z is present, otherwise {x, y})
    // Your Pydantic model expects x1, y1, x2, y2, etc.
    const requestBody = {};
    for (let i = 0; i < landmarks.length; i++) {
      requestBody[`x${i + 1}`] = landmarks[i].x;
      requestBody[`y${i + 1}`] = landmarks[i].y;
      // If your model uses 'z' coordinates, uncomment the line below:
      // requestBody[`z${i + 1}`] = landmarks[i].z;
    }

    // IMPORTANT: Change the URL to target the /predict endpoint
    const response = await fetch("http://127.0.0.1:8000/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody) // Send the flattened object
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error:", response.status, response.statusText, errorText);
      return null;
    }

    const result = await response.json();
    console.log("Predicted hand sign (action):", result.action);

    // Map the predicted action to arrow key directions
    let arrowDirection = null;
    switch (result.action) {
      case "one":
        arrowDirection = "up";
        break;
      case "two_up": // Changed from "two" to "two_up" based on API output
        arrowDirection = "down";
        break;
      case "three":
      case "three2": // Added "three2" to also map to right, based on API output
        arrowDirection = "right";
        break;
      case "four":
        arrowDirection = "left";
        break;
      default:
        // If the action is not one of the defined gestures, return null
        arrowDirection = null;
        break;
    }

    return arrowDirection; // Return the mapped direction
  } catch (error) {
    console.error("Prediction error:", error);
    return null;
  }
}
