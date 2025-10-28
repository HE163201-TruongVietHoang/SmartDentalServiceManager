const Service = require("../../model/service");

exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.getAllServices();
    res.json(services);
  } catch (err) {
    console.error("Error fetching services:", err);
    res.status(500).json({ error: "Failed to fetch services" });
  }
};

exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.getServiceById(req.params.id);
    if (!service) return res.status(404).json({ message: "Service not found" });
    res.json(service);
  } catch (err) {
    res.status(500).json({ error: "Failed to get service" });
  }
};

exports.createService = async (req, res) => {
  try {
    await Service.createService(req.body);
    res.status(201).json({ message: "Service created successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to create service" });
  }
};

exports.updateService = async (req, res) => {
  try {
    await Service.updateService(req.params.id, req.body);
    res.json({ message: "Service updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update service" });
  }
};

exports.deleteService = async (req, res) => {
  try {
    await Service.deleteService(req.params.id);
    res.json({ message: "Service deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete service" });
  }
};
