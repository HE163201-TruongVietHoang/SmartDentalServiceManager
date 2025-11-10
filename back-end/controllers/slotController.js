const { slotService } = require("../services/slotService");

const slotController = {
  async getAvailable(req, res) {
    try {
      const { doctorId, date } = req.query;
      if (!doctorId || !date) return res.status(400).json({ message: "doctorId và date là bắt buộc" });

      const slots = await slotService.getAvailableSlots(parseInt(doctorId), date);
      res.json(slots);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};

module.exports = { slotController };
