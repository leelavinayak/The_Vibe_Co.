const Service = require('../models/Service');

// @desc    Get all services
// @route   GET /api/services
const getServices = async (req, res) => {
  try {
    const { type, search, state, city } = req.query;
    const query = {};
    if (type) query.type = type;
    if (state) query.state = state;
    if (city) query.city = city;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const services = await Service.find(query).sort('-rating');
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single service
// @route   GET /api/services/:id
const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (service) {
      res.json(service);
    } else {
      res.status(404).json({ message: 'Service not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a service
// @route   POST /api/services
const createService = async (req, res) => {
  try {
    const service = await Service.create(req.body);

    // Send Welcome Notification to Service Provider
    if (service.email || service.phone) {
      try {
        const sendEmail = require('../services/emailService');
        const sendWhatsAppMessage = require('../services/whatsappService');

        if (service.email) {
          await sendEmail({
            email: service.email,
            subject: 'Welcome to THE VIBE CO. - Partner Onboarding',
            message: `Hello ${service.name}, you have been successfully added as a service provider in THE VIBE CO. platform. We are excited to showcase your work!`,
            html: `
              <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #C9A84C; border-radius: 12px;">
                <h2 style="color: #C9A84C;">THE VIBE CO.</h2>
                <p>Hello <strong>${service.name}</strong>,</p>
                <p>Welcome to our premium event marketplace! You have been successfully added as a <strong>${service.type.replace(/_/g, ' ')}</strong> provider.</p>
                <p>Your profile is now live and visible to our premium clients.</p>
                <p style="font-size: 0.8rem; color: #777; margin-top: 20px;">Best Regards,<br/>The Vibe Co. Management</p>
              </div>
            `
          });
        }

        if (service.phone) {
          await sendWhatsAppMessage(
            service.phone,
            `Hello ${service.name}, welcome to THE VIBE CO.! Your ${service.type.replace(/_/g, ' ')} service profile has been successfully added to our premium marketplace.`
          );
        }
      } catch (notifError) {
        console.error('Service Onboarding Notification Error:', notifError);
      }
    }

    res.status(201).json(service);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a service (Admin only)
// @route   PUT /api/services/:id
const updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    if (req.user.role !== 'admin' && req.user.serviceId?.toString() !== service._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this service' });
    }

    const updatedService = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedService);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a service (Admin only)
// @route   DELETE /api/services/:id
const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (service) {
      await service.deleteOne();
      res.json({ message: 'Service removed' });
    } else {
      res.status(404).json({ message: 'Service not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService
};
