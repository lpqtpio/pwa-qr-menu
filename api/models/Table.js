import mongoose from "mongoose";

const tableSchema = new mongoose.Schema({
  number: {
    type: Number,
    required: true,
    unique: true
  },
 
   seats: {
     type: Number,
     required: true
   },
   status: {
     type: String,
     enum: ['available', 'occupied', 'reserved'],
    default: 'available'
   }
}, {
  timestamps: true 
});

const Table = mongoose.model.Table || mongoose.model("Table", tableSchema);

export default Table;