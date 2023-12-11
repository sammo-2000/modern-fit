const Event_Model = require('../models/Event_Model');
const validator = require('validator');
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb')

const get_all_events = async (req, res) => {
    // Get all events after today
    const events = await Event_Model.find();

    let events_after_today = [];

    events.forEach(event => {
        const event_date = new Date(event.date);
        const today = new Date() - 1 * 24 * 60 * 60 * 1000;
        if (event_date >= today) {
            events_after_today.push(event);
        } else {
            // Delete event
            event.deleteOne({ _id: new ObjectId(event._id) })
        }
    });

    // Return response
    return res.status(200).json({ success: true, events: events_after_today });
}

const create_event = async (req, res) => {
    const { name, description, time, capacity, date, trainers, url, alt } = req.body;

    // Valdiate input are sent
    if (!name) return res.status(400).json({ success: false, error: "Name is required" });
    if (!description) return res.status(400).json({ success: false, error: "description is required" });
    if (!time) return res.status(400).json({ success: false, error: "Time is required" });
    if (!capacity) return res.status(400).json({ success: false, error: "Capacity is required" });
    if (!date) return res.status(400).json({ success: false, error: "Date is required" });
    if (!trainers) return res.status(400).json({ success: false, error: "Trainers is required" });
    if (!url) return res.status(400).json({ success: false, error: "Image is required" });
    if (!alt) return res.status(400).json({ success: false, error: "Image description is required" });

    // Validate input are correct
    // Name
    if (!validator.isLength(name, { min: 5, max: 20 }))
        return res.status(400).json({ success: false, error: "Name must be between 5 and 20 characters" });
    if (!/^[a-zA-Z0-9\s]*$/.test(name))
        return res.status(400).json({ success: false, error: "Name must only contain letters and numbers" });

    // description
    if (!validator.isLength(description, { min: 10, max: 200 }))
        return res.status(400).json({ success: false, error: "Description must be between 10 and 200 characters" });
    if (!/^[a-zA-Z0-9\s]*$/.test(description))
        return res.status(400).json({ success: false, error: "Description must only contain letters and numbers" });

    // Time
    if (!validator.isTime(time))
        return res.status(400).json({ success: false, error: "Time must be a valid time" });
    const time_split = time.split(":");
    const time_hour = parseInt(time_split[0]);
    if (time_hour < 7 || time_hour > 17)
        return res.status(400).json({ success: false, error: "Time must be between 07:00 and 17:00" });
    if (time_hour === 17 && parseInt(time_split[1]) > 0)
        return res.status(400).json({ success: false, error: "Time must be between 07:00 and 17:00" });

    // Capacity
    if (!validator.isInt(capacity))
        return res.status(400).json({ success: false, error: "Capacity must be a number" });
    if (capacity < 5 || capacity > 50)
        return res.status(400).json({ success: false, error: "Capacity must be between 5 and 50" });

    // Date
    if (!validator.isDate(date))
        return res.status(400).json({ success: false, error: "Date must be a valid date" });
    const chosen_timestamp = new Date(date).getTime();
    const two_days_ahead = Date.now() + 1 * 24 * 60 * 60 * 1000;
    if (chosen_timestamp <= two_days_ahead)
        return res.status(400).json({ success: false, error: "Date must be 2 days into future" });

    // Trainers
    if (!Array.isArray(trainers))
        return res.status(400).json({ success: false, error: "Trainers must be an array" });
    if (trainers.length < 1)
        return res.status(400).json({ success: false, error: "Trainers must have at least 1 trainer" });
    for (let i = 0; i < trainers.length; i++) {
        if (!mongoose.Types.ObjectId.isValid(trainers[i]._id))
            return res.status(400).json({ success: false, error: "Trainer ID invalid" });
        if (!trainers[i].name)
            return res.status(400).json({ success: false, error: "Trainer name is required" });
        if (!/^[a-zA-Z\s]*$/.test(trainers[i].name))
            return res.status(400).json({ success: false, error: "Trainer name must be letters only" });
    }

    // URL
    if (!validator.isURL(url))
        return res.status(400).json({ success: false, error: "Image URL invalid" });

    // Alt
    if (!validator.isLength(alt, { min: 2, max: 40 }))
        return res.status(400).json({ success: false, error: "Image description must be between 2 and 40 characters" });

    // Create event
    const event = await Event_Model.create({ name, description, time, capacity, date, trainers, alt, url });

    // Return response
    res.status(201).json({
        success: true,
        message: "Create event",
        event
    });
}

const get_event = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({ success: false, error: "Event ID invalid" });

    const event = await Event_Model.findById(id);
    if (!event) return res.status(404).json({ success: false, error: "Event not found" });

    // Count registered users
    event.current_register = event.registered_users.length

    const event_data = {
        _id: event._id,
        name: event.name,
        description: event.description,
        time: event.time,
        capacity: event.capacity,
        date: event.date,
        trainers: event.trainers,
        url: event.url,
        alt: event.alt,
        current_register: event.current_register,
    }

    return res.json({
        success: true,
        event: event_data
    });
}

const update_event = async (req, res) => {
    res.json({
        success: true,
        message: "Update event",
    });
}

const delete_event = async (req, res) => {
    res.json({
        success: true,
        message: "Delete event",
    });
}

const register = async (req, res) => {
    const { id } = req.params;
    const user_id = req._user._id;

    // Check ID is valid
    if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({ success: false, error: "Event ID invalid" });

    // Get all register users ID
    const event = await Event_Model.findById(id);
    if (!event) return res.status(404).json({ success: false, error: "Event not found" });

    // Check if user is already registered
    const user_already_registered = event.registered_users?.includes(user_id);

    // If user is registered, unregister
    if (user_already_registered) {
        // Remove user from registered users
        event.registered_users.pull(user_id);
        event.save();

        // Return response
        return res.json({
            success: true,
            message: "Unregister from the event",
        });
    }

    // Check event is not full
    const event_full = event.registered_users.length >= event.capacity;
    if (event_full) return res.status(400).json({ success: false, error: "Event is full" });

    // If user is not registered, register
    event.registered_users.push(user_id);
    event.save();

    // Return response
    return res.json({
        success: true,
        message: "Registered for the event",
    });
}

module.exports = {
    get_all_events,
    create_event,
    get_event,
    update_event,
    delete_event,
    register,
}