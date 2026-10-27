const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Entry = require('../models/Entry');

const resolvers = {
    Query: {
        hello: () => 'Hello from the backend!',
        me: async (parent, args, context) => {
            if(!context.userId){
                throw new Error('You must be logged in');
            }
            return User.findById(context.userId);
        },

        myEntries: async (parent, args, context) =>{
            if(!context.userId){
                throw new Error('You must be logged in');
            }
            return Entry.find({userId: context.userId});
        },

        entry: async (parent, {id}, context) =>{
            if(!context.userId){
                throw new Error('You must be logged in')
            }
            return Entry.findOne({
                _id: id,
                userId: context.userId
            });
        },

        entriesByStatus: async (parent, args, context) =>{
            if(!context.userId){
                throw new Error('You must be logged in')
            }

            return Entry.find({
                userId: context.userId,
                status: args.status
            });
        },
    },

    // LOGIN & REGISTER MUTATION (similar to setters)
    Mutation: {
        register: async (parent, { username, email, password }) => {
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await User.create({ username, email, password: hashedPassword });
            return jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {expiresIn : '1d'});
        },

        login: async (parent, { username, password }) => {
            const user = await User.findOne({ username });
            if (!user) throw new Error('User not found.');

            const valid = await bcrypt.compare(password, user.password);
            if (!valid) throw new Error('Invalid password');

            return jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {expiresIn : '1d'});
        },

        addEntry: async (parent, {title, mediaType}, context) => {
            if(!context.userId){
                throw new Error('You must be logged in');
            }
            
            const cleanTitle = title.trim();

            const existingEntry = await Entry.findOne({
                userId: context.userId,
                title: cleanTitle,
                mediaType: mediaType
            }).collation({locale: 'en', strength: 2});

            if (existingEntry){
                throw new Error('You already have this title in your list');
            }

            return Entry.create({
                title: title,
                mediaType: mediaType,
                userId: context.userId
            });
        },

        updateEntry: async (parent, {id, title, status, rating, progress, notes}, context) =>{
            if(!context.userId){
                throw new Error('You must be logged in');
            }

            const entry = await Entry.findOne({
                _id:id,
                userId:context.userId
            });
            
            if (!entry){
                throw new Error('Entry not found');
            }

            if(title !== undefined){
                if(title === null || title.trim() === ''){
                    throw new Error('Title cannot be empty');
                }

                const cleanTitle = title.trim();

                const existingEntry = await Entry.findOne({
                    _id: {$ne:id},
                    userId: context.userId,
                    title: cleanTitle,
                    mediaType: mediaType
                }).collation({locale: 'en', strength: 2});

                if (existingEntry){
                    throw new Error('You already have this title in your list');
                }
            }

            

            if(status !== undefined) entry.status = status;
            if(rating !== undefined) entry.rating = rating;
            if(progress !== undefined) entry.progress = progress;
            if(notes !== undefined) entry.notes = notes;

            await entry.save();
            return entry;
        },

        deleteEntry: async(parent, {id}, context) => {
            if(!context.userId){
                throw new Error('You must be logged in');
            }
            const deletedEntry = await Entry.findOneAndDelete({
                _id:id,
                userId: context.userId
            });

            return deletedEntry !== null;
        },

        incrementProgress: async(parent,{id}, context) => {
            if(!context.userId){
                throw new Error('You must be logged in');
            }

            const entry = await Entry.findOne({
                _id: id,
                userId: context.userId
            });

            if(!entry){
                throw new Error('Entry not found');
            }

            entry.progress += 1;

            await entry.save();
            return entry;
        }




    },
};

module.exports = resolvers;