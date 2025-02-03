declare global {
    type Vehicle = {
        id: string;
        startYear: number;
        endYear: number | null;
        make: string;
        model: string;
        price: number;
        electric: boolean;
    }
}

export {}