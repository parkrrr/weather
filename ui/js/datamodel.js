export class DataModel {
    constructor(timestamp) {
        this.timestamp = timestamp;
    }

    readableTimeStamp() {
        return moment(new Date(this.timestamp)).toString();
    }
}

export class PressureModel extends DataModel {
    constructor(timestamp, val) {
        super(timestamp);

        this.value = this.pascalsToInchesMercury(val);
    }

    formatValue() {
        return `${this.value.toFixed(2)} inHg`;
    }

    toDataPoint() {
        return {
            x: new Date(this.timestamp),
            y: this.value.toFixed(2)
        }
    }

    toString() {
        let obs = moment(new Date(this.timestamp));
        return `${this.formatValue()} as of ${obs.from(moment().utc())}`;
    }

    pascalsToInchesMercury(pa) {
        return pa * 0.0002953;
    }
}