import {Response} from "express"
import { AuthenticatedRequest } from "@/middlewares";
import httpStatus from "http-status";
import bookingService from "@/services/booking-service";
import { Booking } from "@prisma/client";



export async function getBooking(req:AuthenticatedRequest, res:Response){
    const {userId} = req;
    
    try{
        
        const booking = await bookingService.listBooking(userId)
        return res.status(httpStatus.OK).send(booking)

    }catch(error){
           
        
        return res.sendStatus(httpStatus.NOT_FOUND)
    }

}

export async function postBooking(req:AuthenticatedRequest, res:Response){
    //Apenas usuários com ticket presencial, com hospedagem e pago podem fazer reservas.

    try{
    const {userId} = req;
    const {roomId} = req.body as Booking;
    
    
    
    await bookingService.createBooking(userId, roomId);

    return res.sendStatus(httpStatus.OK)

    }catch(error){
        if(error.name === "NotFoundError"){
            return res.sendStatus(httpStatus.NOT_FOUND)
        }

        return res.sendStatus(httpStatus.FORBIDDEN)
    }

}

export async function putBooking(req:AuthenticatedRequest, res:Response){
//Sucesso: Deve retornar status code 200 com bookingId
    try{
        const {userId} = req
        const {bookingId} = req.params; 
        const {roomId} = req.body as Booking
                
        const updateBooking = await bookingService.updateBooking(Number(bookingId),userId, roomId)

        return res.status(httpStatus.OK).send({bookingId:updateBooking.id})

    }catch(error){

        if(error.name==="NotFoundError"){
            return res.sendStatus(httpStatus.NOT_FOUND)
        }
        return res.send(httpStatus.FORBIDDEN)
    }
}