import { createBooking } from "../factories/booking-factory"
import app, { init } from "@/app";
import { cleanDb, generateValidToken } from "../helpers";
import supertest from "supertest";
import httpStatus from "http-status";
import faker from "@faker-js/faker"
import { createEnrollmentWithAddress, 
    createHotel, 
    createPayment, 
    createRoomWithHotelId, 
    createTicket, 
    createTicketType, 
    createTicketTypeRemote, 
    createTicketTypeWithHotel, 
    createTicketTypeWithoutRemoteAndHotel, createUser } from "../factories";
import * as jwt from "jsonwebtoken";
import { TicketStatus } from "@prisma/client";


const api = supertest(app)

beforeAll(async ()=>{
    await init();
    await cleanDb();
});

beforeEach(async ()=>{
    await cleanDb();
})

describe("GET /booking", ()=>{

        it("should respond with 401 if no token is given  ", async () =>{
            const response = await api.get("/booking");

            expect(response.status).toBe(httpStatus.UNAUTHORIZED)
        })

        it("should respond with 401 if no token is invalid ", async () =>{
            const token = faker.lorem.word()

            const response = await api.get("/booking").set("Authorization",`Bearer ${token}`);


            expect(response.status).toBe(httpStatus.UNAUTHORIZED)

        })
        it("should respond with 401 if the given token has no session  ", async () =>{
            const user = await createUser();
            const token = jwt.sign({userId: user.id}, process.env.JWT_SECRET);

            const response = await api.get("/booking").set("Authorization", `Bearer ${token}`)

            expect(response.status).toBe(httpStatus.UNAUTHORIZED)
        })

        describe ("When token is valid", ()=>{

            it("should respond with status 403 when user has no enrollment", async ()=>{
                const user = await createUser()
                const token = await generateValidToken(user)

                const response = await api.get("/booking").set("Authorization", `Bearer ${token}`)

                expect(response.status).toBe(httpStatus.FORBIDDEN)
            })

            it("should respond with status 403 when user has no ticket", async ()=>{
                const user = await createUser()
                const token = await generateValidToken(user)
                const enrollment = await createEnrollmentWithAddress(user)

                const response = await api.get("/booking").set("Authorization", `Bearer ${token}`)

                expect (response.status).toBe(httpStatus.FORBIDDEN)
            })

            it("should respond with status 403 when ticket is remote", async ()=>{
            const user = await createUser()
            const token = await generateValidToken(user)
            const enrollment = await createEnrollmentWithAddress(user)
            const ticketType = await createTicketTypeRemote();
            const ticket = await createTicket(enrollment.id,ticketType.id,TicketStatus.PAID);
            const payment = await createPayment(ticket.id,ticketType.price)

            const response = await api.get("/booking").set("Authorization", `Bearer ${token}`)

            expect (response.status).toBe(httpStatus.FORBIDDEN)

            })

            it("should respond with status 403 when user has no payment", async ()=>{
            const user = await createUser()
            const token = await generateValidToken(user)
            const enrollment = await createEnrollmentWithAddress(user)
            const ticketType = await createTicketTypeRemote();
            const ticket = await createTicket(enrollment.id,ticketType.id,TicketStatus.RESERVED)

            const response = await api.get("/booking").set("Authorization", `Bearer ${token}`)

            expect (response.status).toBe(httpStatus.FORBIDDEN)
            })

            it("should respond with status 403 when ticket doesn't include hotel", async ()=>{
                const user = await createUser()
                const token = await generateValidToken(user)
                const enrollment = await createEnrollmentWithAddress(user)
                const ticketType = await createTicketTypeWithoutRemoteAndHotel();
                const ticket = await createTicket(enrollment.id,ticketType.id,TicketStatus.PAID);
                const payment = await createPayment(ticket.id,ticketType.price)
    
                const response = await api.get("/booking").set("Authorization", `Bearer ${token}`)
    
                expect (response.status).toBe(httpStatus.FORBIDDEN)
    
                })
             it("should respond with status 403 when ticket is remote", async ()=>{
            const user = await createUser()
            const token = await generateValidToken(user)
            const enrollment = await createEnrollmentWithAddress(user)
            const ticketType = await createTicketTypeRemote();
            const ticket = await createTicket(enrollment.id,ticketType.id,TicketStatus.PAID);
            const payment = await createPayment(ticket.id,ticketType.price)

            const response = await api.get("/booking").set("Authorization", `Bearer ${token}`)

            expect (response.status).toBe(httpStatus.FORBIDDEN)

            })

            it("should respond with status 200 and booking body", async ()=>{
                const user = await createUser()
                const token = await generateValidToken(user)
                const enrollment = await createEnrollmentWithAddress(user)
                const ticketType = await createTicketTypeWithHotel();
                const ticket = await createTicket(enrollment.id,ticketType.id,TicketStatus.PAID);
                const payment = await createPayment(ticket.id,ticketType.price)
                const hotel = await createHotel();
                const room = await createRoomWithHotelId(hotel.id)
                const booking = await createBooking(user.id,room.id)

                const response = await api.get("/booking").set("Authorization", `Bearer ${token}`)
                
   
                expect(response.status).toBe(httpStatus.OK)
                expect(response.body).toEqual({
                    id:booking.id,
                    Room:{
                        id: room.id,
                        name: room.name,
                        capacity: room.capacity,
                        hotelId: room.hotelId,
                        createdAt: room.createdAt.toISOString(),
                        updatedAt: room.updatedAt.toISOString(),
                    }
                })
                })
        

    })

   

})

describe("POST /booking",()=>{

    it("should respond with 401 if no token is given  ", async () =>{
        const response = await api.post("/booking");

        expect(response.status).toBe(httpStatus.UNAUTHORIZED)
    })

    it("should respond with 401 if no token is invalid ", async () =>{
        const token = faker.lorem.word()

        const response = await api.post("/booking").set("Authorization",`Bearer ${token}`);


        expect(response.status).toBe(httpStatus.UNAUTHORIZED)

    })
    it("should respond with 401 if the given token has no session  ", async () =>{
        const user = await createUser();
        const token = jwt.sign({userId: user.id}, process.env.JWT_SECRET);

        const response = await api.post("/booking").set("Authorization", `Bearer ${token}`)

        expect(response.status).toBe(httpStatus.UNAUTHORIZED)
    })
    describe ("When token is valid", ()=>{
        it("should respond with status 400 if body param roomId is not sent", async ()=>{
                const user = await createUser();
                const token = await generateValidToken(user);
                const enrollment = await createEnrollmentWithAddress(user);
                const ticketType = await createTicketTypeWithHotel();
                const ticket = await createTicket(enrollment.id,ticketType.id,TicketStatus.PAID);
                const payment = await createPayment(ticket.id,ticketType.price);
                const hotel = await createHotel();
                const room = await createRoomWithHotelId(hotel.id)
                const body = {};


            const response = await api.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
            expect(response.status).toBe(httpStatus.BAD_REQUEST);
        })
        it("should respond with status 400 if body param roomId type is not correct", async ()=>{
            const user = await createUser();
                const token = await generateValidToken(user);
                const enrollment = await createEnrollmentWithAddress(user);
                const ticketType = await createTicketTypeWithHotel();
                const ticket = await createTicket(enrollment.id,ticketType.id,TicketStatus.PAID);
                const payment = await createPayment(ticket.id,ticketType.price);
                const hotel = await createHotel();
                const room = await createRoomWithHotelId(hotel.id)
                const body = {roomId:"x"};


            const response = await api.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
            expect(response.status).toBe(httpStatus.BAD_REQUEST);
        })
        it("should respond with status 403 when there is no enrollment", async ()=>{
                const user = await createUser();
                const token = await generateValidToken(user);
                const ticketType = await createTicketTypeWithHotel();
                const hotel = await createHotel();
                const room = await createRoomWithHotelId(hotel.id);
                const body = {roomId: room.id}


                const response = await api.get("/booking").set("Authorization", `Bearer ${token}`).send(body);

                expect(response.status).toBe(httpStatus.FORBIDDEN)
            })

            it("should respond with status 403 when there is no ticket", async ()=>{
                const user = await createUser();
                const token = await generateValidToken(user);
                const enrollment = await createEnrollmentWithAddress(user);
                const ticketType = await createTicketTypeWithHotel();
                const hotel = await createHotel();
                const room = await createRoomWithHotelId(hotel.id)
                const body= {roomId:room.id}

                const response = await api.get("/booking").set("Authorization", `Bearer ${token}`).send(body);

                expect(response.status).toBe(httpStatus.FORBIDDEN)
            })

            it("should respond with status 403 when there is no payment", async ()=>{
                const user = await createUser();
                const token = await generateValidToken(user);
                const enrollment = await createEnrollmentWithAddress(user);
                const ticketType = await createTicketTypeWithHotel();
                const ticket = await createTicket(enrollment.id, ticketType.id,TicketStatus.RESERVED);
                const hotel = await createHotel();
                const room = await createRoomWithHotelId(hotel.id);
                const body = {roomId: room.id};
            
                const response = await api.post("/booking").set("Authorization", `Bearer ${token}`).send(body) ;
                expect(response.status).toBe(httpStatus.FORBIDDEN)
            })

            it("should respond with status 403 when ticket is remote", async ()=>{
                const user = await createUser();
                const token = await generateValidToken(user);
                const enrollment = await createEnrollmentWithAddress(user);
                const ticketType = await createTicketTypeRemote();
                const ticket = await createTicket(enrollment.id, ticketType.id,TicketStatus.PAID);
                const hotel = await createHotel();
                const payment = await createPayment(ticket.id, ticketType.price);
                const room = await createRoomWithHotelId(hotel.id);
                const body = {roomId: room.id};
            
                const response = await api.post("/booking").set("Authorization", `Bearer ${token}`).send(body) ;
                expect(response.status).toBe(httpStatus.FORBIDDEN)
            })
            it("should respond with status 403 when ticket has no hotel", async ()=>{
                const user = await createUser();
                const token = await generateValidToken(user);
                const enrollment = await createEnrollmentWithAddress(user);
                const ticketType = await createTicketTypeWithoutRemoteAndHotel()
                const ticket = await createTicket(enrollment.id, ticketType.id,TicketStatus.PAID);
                const hotel = await createHotel();
                const room = await createRoomWithHotelId(hotel.id);
                const body = {roomId: room.id};
            
                const response = await api.post("/booking").set("Authorization", `Bearer ${token}`).send(body) ;
                expect(response.status).toBe(httpStatus.FORBIDDEN);

            })

            it("should respond with status 404 when roomId doesnt exist", async ()=>{
                const user = await createUser();
                const token = await generateValidToken(user);
                const enrollment = await createEnrollmentWithAddress(user);
                const ticketType = await createTicketTypeWithHotel();
                const ticket = await createTicket(enrollment.id, ticketType.id,TicketStatus.PAID);
                const hotel = await createHotel();
                const room = await createRoomWithHotelId(hotel.id);
                const body = {roomId: 0};
            
                const response = await api.post("/booking").set("Authorization", `Bearer ${token}`).send(body) ;
                expect(response.status).toBe(httpStatus.NOT_FOUND);
            })
            it("should respond with status 403 when room is full", async ()=>{
                const user = await createUser();
                const token = await generateValidToken(user);
                const enrollment = await createEnrollmentWithAddress(user);
                const ticketType = await createTicketTypeWithHotel();
                const ticket = await createTicket(enrollment.id, ticketType.id,TicketStatus.PAID);
                const hotel = await createHotel();
                const room = await createRoomWithHotelId(hotel.id);
                const body = {roomId: room.id};
                await createBooking(user.id,room.id)
                await createBooking(user.id,room.id)
                await createBooking(user.id,room.id)
            
                const response = await api.post("/booking").set("Authorization", `Bearer ${token}`).send(body) ;
                expect(response.status).toBe(httpStatus.FORBIDDEN)
            })

            it("should respond with status 200 and booking body", async ()=>{
                const user = await createUser();
                const token = await generateValidToken(user);
                const enrollment = await createEnrollmentWithAddress(user);
                const ticketType = await createTicketTypeWithHotel();
                const ticket = await createTicket(enrollment.id,ticketType.id, TicketStatus.PAID);
                const payment = await createPayment(ticket.id, ticketType.price)
                const hotel = await createHotel();
                const room = await createRoomWithHotelId(hotel.id)
                const body = {roomId:room.id}
               

                const response = await api.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
                
                expect(response.status).toBe(httpStatus.OK)

                expect(response.body).toEqual({
                    bookingId:expect.any(Number)                                     
                })
            })

    })

})

describe("PUT /:bookingId", ()=>{
    
    it("should respond with 401 if no token is given  ", async () =>{
        const response = await api.put("/booking/1");

        expect(response.status).toBe(httpStatus.UNAUTHORIZED)
    })

    it("should respond with 401 if no token is invalid ", async () =>{
        const token = faker.lorem.word()

        const response = await api.put("/booking/1").set("Authorization",`Bearer ${token}`);


        expect(response.status).toBe(httpStatus.UNAUTHORIZED)

    })
    it("should respond with 401 if the given token has no session  ", async () =>{
        const user = await createUser();
        const token = jwt.sign({userId: user.id}, process.env.JWT_SECRET);

        const response = await api.put("/booking/1").set("Authorization", `Bearer ${token}`)

        expect(response.status).toBe(httpStatus.UNAUTHORIZED)
    })

    describe("when token is valid", ()=>{
        
        it("should respond with status 400 if body param roomId is missing", async ()=>{
            const user = await createUser();
            const token = await generateValidToken(user);
            const body = {};


        const response = await api.put("/booking/1").set("Authorization", `Bearer ${token}`).send(body);
        expect(response.status).toBe(httpStatus.BAD_REQUEST);
        })
        
        it("should respond with status 400 if body param roomId it of different type",async () =>{
            const user = await createUser();
            const token = await generateValidToken(user);
            const body = {roomId:"z"}

            const response = await api.put("/booking/1").set("Authorization", `Bearer ${token}`).send(body);
        expect(response.status).toBe(httpStatus.BAD_REQUEST);


        })

        it("should respond with 403 if user doesnt have enrollment", async ()=>{
            const user = await createUser();
            const token = await generateValidToken(user);
            const body = {roomId:10}

            const response = await api.put("/booking/1").set("Authorization", `Bearer ${token}`).send(body);
        expect(response.status).toBe(httpStatus.FORBIDDEN);
        })

        it("should respond with 403 if there isnt ticket", async ()=>{
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user)
            const body = {roomId:10}

            const response = await api.put("/booking/1").set("Authorization", `Bearer ${token}`).send(body);
        expect(response.status).toBe(httpStatus.FORBIDDEN);
        })

        it("should respond with 403 if there isnt payment", async ()=>{
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user)
            const ticketType = await createTicketTypeWithHotel()
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED)
            const body = {roomId:10}

            const response = await api.put("/booking/1").set("Authorization", `Bearer ${token}`).send(body);
        expect(response.status).toBe(httpStatus.FORBIDDEN);
        })

        it("should respond with 403 if ticket type is remote", async ()=>{
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeRemote();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const payment = await createPayment(ticket.id, ticketType.price)
            const body = {roomId:10}

            const response = await api.put("/booking/1").set("Authorization", `Bearer ${token}`).send(body);
        expect(response.status).toBe(httpStatus.FORBIDDEN);
        })
       

        it("should respond with 403 if there isnt hotel included", async ()=>{
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user)
            const ticketType = await createTicketTypeWithoutRemoteAndHotel()
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID)
            const payment = await createPayment(ticket.id, ticketType.price)
            const body = {roomId:10}

            const response = await api.put("/booking/1").set("Authorization", `Bearer ${token}`).send(body);
        expect(response.status).toBe(httpStatus.FORBIDDEN);
        })
        
        it("should respond with 403 if there isnt booking", async ()=>{
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user)
            const ticketType = await createTicketTypeWithHotel()
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID)
            const payment = await createPayment(ticket.id, ticketType.price)
            const body = {roomId:10}

            const response = await api.put("/booking/1").set("Authorization", `Bearer ${token}`).send(body);
        expect(response.status).toBe(httpStatus.FORBIDDEN);
        })
        
        it("should respond with 403 if the booking belongs to another user", async ()=>{
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user)
            const ticketType = await createTicketTypeWithHotel()
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID)
            const payment = await createPayment(ticket.id, ticketType.price)
            const hotel = await createHotel()
            const room = await createRoomWithHotelId(hotel.id)
            const booking = await createBooking(user.id, room.id)
            const otherUser = await createUser();
            const otherBooking = await createBooking(otherUser.id,room.id )
            const otherRoom = await createRoomWithHotelId(hotel.id)
            const body = {roomId: otherRoom.id}

            const response = await api.put(`/booking/${otherBooking.id}`).set("Authorization", `Bearer ${token}`).send(body);
        expect(response.status).toBe(httpStatus.FORBIDDEN);
        })
        
        it("should respond with 403 if update is for thee same roomId", async ()=>{
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user)
            const ticketType = await createTicketTypeWithHotel()
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID)
            const payment = await createPayment(ticket.id, ticketType.price)
            const hotel = await createHotel();
            const room = await createRoomWithHotelId(hotel.id);
            const booking = await createBooking(user.id, room.id);
            const body = {roomId:room.id}

            const response = await api.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send(body);
        expect(response.status).toBe(httpStatus.FORBIDDEN);
        })

        it("should respond with 404 if update is roomId doesnt exist", async ()=>{
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user)
            const ticketType = await createTicketTypeWithHotel()
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID)
            const payment = await createPayment(ticket.id, ticketType.price)
            const hotel = await createHotel();
            const room = await createRoomWithHotelId(hotel.id);
            const booking = await createBooking(user.id, room.id);
            const body = {roomId: 0}

            const response = await api.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send(body);
        expect(response.status).toBe(httpStatus.NOT_FOUND);

        })
        
        it("should respond with 403 when room is full", async ()=>{
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user)
            const ticketType = await createTicketTypeWithHotel()
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID)
            const payment = await createPayment(ticket.id, ticketType.price)
            const hotel = await createHotel();
            const room = await createRoomWithHotelId(hotel.id);
            const booking = await createBooking(user.id, room.id);
            const otherRoom = await createRoomWithHotelId(hotel.id)
            await createBooking(user.id, otherRoom.id);
            await createBooking(user.id, otherRoom.id);
            await createBooking(user.id, otherRoom.id);
            await createBooking(user.id, otherRoom.id);

            const body = {roomId:otherRoom.id}

            const response = await api.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send(body);
        expect(response.status).toBe(httpStatus.FORBIDDEN);
        })
        
        it("should respond with 200 and update body when successfull ", async ()=>{
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user)
            const ticketType = await createTicketTypeWithHotel()
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID)
            const payment = await createPayment(ticket.id, ticketType.price)
            const hotel = await createHotel();
            const room = await createRoomWithHotelId(hotel.id);
            const booking = await createBooking(user.id, room.id);
            const updateRoom = await createRoomWithHotelId(hotel.id)
            
            const body = {roomId:updateRoom.id}

            const response = await api.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send(body);

        expect(response.status).toBe(httpStatus.OK);

        expect(response.body).toEqual({
            bookingId: expect.any(Number)
        })

    })
})

})