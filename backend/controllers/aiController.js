const aiChat = async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, message: 'Please provide a message' });
  }

  // Professional Detailing AI Logic (Simulated)
  const lowerMsg = message.toLowerCase();
  let response = "";

  if (lowerMsg.includes("price") || lowerMsg.includes("cost") || lowerMsg.includes("rupees") || lowerMsg.includes("rs")) {
    response = "Our detailing packages start from Rs. 2,500 for a basic exterior wash and go up to Rs. 45,000 for advanced ceramic coatings. You can view the full price list on our Services page!";
  } else if (lowerMsg.includes("book") || lowerMsg.includes("appointment") || lowerMsg.includes("schedule")) {
    response = "You can book an appointment easily through our 'Book Now' page. Just select your vehicle, choose a service, and pick your preferred time slot!";
  } else if (lowerMsg.includes("location") || lowerMsg.includes("address") || lowerMsg.includes("where")) {
    response = "We are located at Phase 6 DHA, Lahore. We also offer doorstep services where our mobile detailing unit comes to you!";
  } else if (lowerMsg.includes("service") || lowerMsg.includes("package") || lowerMsg.includes("offer")) {
    response = "We offer a range of services: Interior Deep Cleaning, Exterior Paint Restoration, Ceramic Coatings, and Engine Bay Detailing. Which one are you interested in?";
  } else if (lowerMsg.includes("time") || lowerMsg.includes("duration") || lowerMsg.includes("long")) {
    response = "A typical detailing session takes between 2 to 6 hours depending on the package you choose. Ceramic coatings may require up to 24 hours for curing.";
  } else if (lowerMsg.includes("hello") || lowerMsg.includes("hi") || lowerMsg.includes("hey")) {
    response = "Hello! I am your AutoDetailPro Assistant. How can I help you make your car look brand new today?";
  } else {
    response = "That's a great question! For specific technical inquiries about your vehicle's paint condition, I recommend booking a free inspection session through our portal.";
  }

  // Simulate a slight delay for realism
  setTimeout(() => {
    res.status(200).json({
      success: true,
      data: response
    });
  }, 500);
};

module.exports = { aiChat };
