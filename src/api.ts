import {faker} from '@faker-js/faker'

export default async function getData(): Promise<Vehicle[]> {
    console.log('called getData')
    return new Promise((res) => {
        setTimeout(() => {
            const data: Vehicle[] = [];
            for (let i = 0; i < 10; i++) {
                data.push({
                    id: faker.database.mongodbObjectId(),
                    make: faker.vehicle.manufacturer(),
                    model: faker.vehicle.model(),
                    startYear: faker.date.past().getFullYear(),
                    endYear: faker.date.future().getFullYear(),
                    price: faker.number.int({min: 10000, max: 75000}),
                    electric: faker.datatype.boolean(),
                    edited: false,
                })
            }
            res(data);
        }, faker.number.int({min: 10, max: 500}))

    });
}