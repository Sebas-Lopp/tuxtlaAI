class TransparencyMetric {
    constructor({ id, indicatorName, value, category, recordedAt }) {
        this.id = id || `metric-${Date.now()}`;
        this.indicatorName = indicatorName;
        this.value = value;
        this.category = category || 'GENERAL';
        this.recordedAt = recordedAt || new Date();

        this.validate();
    }

    validate() {
        if (!this.indicatorName) throw new Error("El nombre del indicador es obligatorio.");
        if (this.value === undefined || this.value === null) throw new Error("El valor de la métrica es obligatorio.");
    }
}

module.exports = TransparencyMetric;