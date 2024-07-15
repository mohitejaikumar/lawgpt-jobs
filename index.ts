import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './UserSchema';
dotenv.config();

const uri = process.env.MONGODB_URI || "";

async function main(){

    try{
    await mongoose.connect(uri);
    
    // monthly and yearly refresh filter 
        try{
        const refreshUsers = await User.aggregate([
            {
                // Add fields for the current date and the difference in days
                $addFields: {
                    currentDate: new Date(),
                    daysDifference: {
                        $divide: [
                        { $subtract: [new Date(), "$purchaseDate"] },
                        1000 * 60 * 60 * 24
                        ]
                    }
                }
            },
            {
                // Add a field to check if the difference in days is a multiple of 30
                $addFields: {
                    isMultipleOfMonth: { $gt: [{ $divide: ["$daysDifference", 30] }, 1] },
                    months:{ 
                        $divide:["$daysDifference", 30]
                    }
                }
            },
            {
                // Match only documents where the difference is a multiple of 30 days
                $match: { isMultipleOfMonth: true }
            },
            {
                $group: {
                    _id : "$plan",
                    users :{
                        $push : {
                            id:"$_id",
                            months: "$months"
                        }
                    }
                }
            },
            ]);

            let  promises:any[] = [];
            refreshUsers.map((plan)=>{
                
                
                if(plan._id === "essential"){
                    promises.push(...plan.users.map((user)=>{
                        if(user.months >=12){
                            // yearly refresh
                            return new Promise<void>(async (resolve,reject)=>{
                                try{
                                    await User.findByIdAndUpdate(user.id,{tokens:0});
                                    resolve();
                                }
                                catch(err){
                                    reject();
                                }
                            })
                        }
                        else{
                            // monthly refresh
                            return new Promise<void>(async (resolve,reject)=>{
                                try{
                                    await User.findByIdAndUpdate(user.id,{tokens:100000});
                                    resolve();
                                }
                                catch(err){
                                    reject();
                                }
                            })
                        }
                    }))
                }
                else if (plan._id === "growth"){
                    promises.push(...plan.users.map((user)=>{
                        if(user.months >=12){
                            // yearly refresh
                            return new Promise<void>(async (resolve,reject)=>{
                                try{
                                    await User.findByIdAndUpdate(user.id,{tokens:0});
                                    resolve();
                                }
                                catch(err){
                                    reject();
                                }
                            })
                        }
                        else{
                            // monthly refresh
                            return new Promise<void>(async (resolve,reject)=>{
                                try{
                                    await User.findByIdAndUpdate(user.id,{tokens:1000000});
                                    resolve();
                                }
                                catch(err){
                                    reject();
                                }
                            })
                        }
                    }))
                }
                else if (plan._id === "custom"){
                    promises.push(...plan.users.map((user)=>{
                        if(user.months >=12){
                            // yearly refresh
                            return new Promise<void>(async (resolve,reject)=>{
                                try{
                                    await User.findByIdAndUpdate(user.id,{tokens:0});
                                    resolve();
                                }
                                catch(err){
                                    reject();
                                }
                            })
                        }
                        else{
                            // monthly refresh
                            return new Promise<void>(async (resolve,reject)=>{
                                try{
                                    await User.findByIdAndUpdate(user.id,{tokens:3400000});
                                    resolve();
                                }
                                catch(err){
                                    reject();
                                }
                            })
                        }
                    }))
                }
            })

            await Promise.all(promises);
            
            
        }
        catch(err){
            console.error.bind(console, 'Refresh error:');
        }
    }
    catch(err){
        mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));
    }
    
}


main();