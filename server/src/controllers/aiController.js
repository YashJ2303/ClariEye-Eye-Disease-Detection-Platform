const chatWithAI = async (req, res) => {
  try {
    const { message, scanContext } = req.body;
    
    // Simulated Medical LLM logic
    let response = "I've analyzed the scan data. ";
    const diagnosis = scanContext.primary_diagnosis;
    const confidence = (scanContext?.confidence * 100).toFixed(1);

    if (message.toLowerCase().includes('why') || message.toLowerCase().includes('markers')) {
      if (diagnosis === 'Normal') {
        response += "The internal structures show clear symmetry. No vascular leakage, exudates, or hemorrhages were detected in the macula or peripheral retina.";
      } else {
        response += `The ${diagnosis} diagnosis is driven by localized pixel intensities in the heatmap matching typical pathological patterns. Specifically, the model identifies potential ${diagnosis === 'Glaucoma' ? 'optic disc cupping' : 'microaneurysms and lipoprotein deposits'} with ${confidence}% certainty.`;
      }
    } else if (message.toLowerCase().includes('risk') || message.toLowerCase().includes('urgency')) {
      response += `The urgency is set to ${scanContext?.urgency}. This is based on the proximity of detected anomalies to the fovea and the overall severity score.`;
    } else {
      response += "Based on current clinical guidelines, I recommend correlating these AI findings with an OCT scan or a manual slit-lamp examination to confirm the micro-vascular architecture.";
    }

    res.json({ response });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { chatWithAI };
