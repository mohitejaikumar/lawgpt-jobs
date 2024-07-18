import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './UserSchema';
dotenv.config();

const uri = process.env.MONGODB_URI || "";

async function main(){

    try{
        
        await mongoose.connect(uri).then(()=>{
            console.log("Connected to MongoDB");
        });
    
        // monthly and yearly refresh filter 
        try{
        
        const refreshUsers = await User.aggregate([
        {
            $addFields: {
                refreshDay:{
                    
                    $dayOfMonth: "$purchaseDate"
                },
                month : {$add: [new Date().getMonth(), 1]},
                year : new Date().getFullYear(),
                purchaseMonth : {
                    $month : "$purchaseDate"
                },
                day: new Date().getDate()
                
            }
        },
        {
            $addFields:{
                maxDay:{
                    $dayOfMonth : {
                        $dateFromParts:{
                        "year" : "$year",
                        "day" : 0,
                        "month" : {$add: ["$month", 1]}
                        } 
                    }
                },
            }
        },
        {
            $addFields:{
                newRefreshDay:{
                    $cond:{
                        if:{$gt:["$refreshDay","$maxDay"]},
                        then: "$maxDay",
                        else: "$refreshDay"
                    }
                }
            }
        },
        {
            $match:{
            newRefreshDay : new Date().getDate()
            }
        },
        {
            $project:{
                plan:1,
                month:1,
                purchaseMonth:1,
                newRefreshDay:1,
                purchaseYear:1,
                year:1
            }
        }])
           
            let  promises:any[] = [];
            refreshUsers.map((user)=>{
                    if(user.month === user.purchaseMonth && user.year !== user.purchaseYear){
                        // yearly refresh
                        promises.push(new Promise<void>(async(resolve,reject)=>{
                            try{
                                    await User.findByIdAndUpdate(user._id,{tokens:0, monthly_cases_limit:0 , paln:"free"});
                                    resolve();
                                }
                                catch(err){
                                    reject();
                                }
                        }))
                    }
                    else{
                        // monthly refresh
                        if(user.plan === "essential"){
                            promises.push(new Promise<void>(async(resolve,reject)=>{
                                try{
                                    await User.findByIdAndUpdate(user._id,{tokens:100000})
                                    resolve();
                                }
                                catch(err){
                                    reject();
                                }
                            }))
                        }
                        else if(user.plan === "growth"){
                            promises.push(new Promise<void>(async(resolve,reject)=>{
                                try{
                                    await User.findByIdAndUpdate(user._id,{tokens:1000000});
                                    resolve();
                                }
                                catch(err){
                                    reject();
                                }
                            }))
                        }
                        else if(user.plan === "custom"){
                            promises.push(new Promise<void>(async(resolve,reject)=>{
                                try{
                                    await User.findByIdAndUpdate(user._id,{tokens:3400000});
                                    resolve();
                                }
                                catch(err){
                                    reject();
                                }
                            }))
                        }
                    }
            })
            
            await Promise.all(promises).then(()=>{
                console.log(`Updated tokens of ${promises.length} users`);
            });

        }
        catch(err){
            console.error.bind(console, 'Refresh error:');
        }
        await mongoose.disconnect();
    }
    catch(err){
        mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));
    }

    process.exit(0);
    
}


main();