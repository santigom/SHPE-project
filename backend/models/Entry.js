const { model, Schema } = require('mongoose');

const EntrySchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    mediaType: { type: String, required: true, enum: ['anime', 'manga'] },
    status: { type: String, required:true, default: 'planned', enum: ['planned', 'in_progress', 'completed', 'on_hold', 'dropped'] },
    rating: { type: Number, required:true, min: 1, max: 10 },
    progress: { type: Number, min: 0, default: 0, validate: { validator: Number.isInteger, message: 'Progress must be a whole number' } },
    notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = model('Entry', EntrySchema);