export abstract class Money {
    protected constructor(public value: number) {

    }

    public abstract getImageUrl(): string;
}

export class TwoEuros extends Money {
    public constructor() {
        super(200);
    }

    public getImageUrl(): string {
        return 'asset/img/2_euros.png';
    }
}

export class OneEuro extends Money {
    public constructor() {
        super(100);
    }

    public getImageUrl(): string {
        return 'asset/img/1_euro.png';
    }
}

export class FiftyCents extends Money {
    public constructor() {
        super(50);
    }

    public getImageUrl(): string {
        return 'asset/img/50_centimes.png';
    }

}

export class TwentyCents extends Money {
    public constructor() {
        super(20);
    }

    public getImageUrl(): string {
        return 'asset/img/20_centimes.png';
    }
}

export class TenCents extends Money {
    public constructor() {
        super(10);
    }

    public getImageUrl() : string {
        return 'asset/img/10_centimes.png';
    }
}

export class FiveCents extends Money {
    public constructor() {
        super(5);
    }

    public getImageUrl(): string {
        return 'asset/img/5_centimes.png';
    }
}

export class TwoCents extends Money {
    public constructor() {
        super(2);
    }

    public getImageUrl(): string {
        return 'asset/img/2_centimes.png';
    }
}

export class OneCent extends Money {
    public constructor() {
        super(1);
    }

    public getImageUrl(): string {
        return 'asset/img/1_centime.png';
    }
}