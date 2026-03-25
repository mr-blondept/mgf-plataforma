export type DosePreset = {
  id: string;
  name: string;
  doseMinMgKg: number;
  doseMaxMgKg: number;
  regimenDivisor: 1 | 2 | 3 | 4;
  concentrationMg: number;
  concentrationMl: number;
  bottleMl: number;
  maxDoseMg: number;
};

export const pediatricDosePresets: DosePreset[] = [
  { id: "manual", name: "Eu escrevo os valores", doseMinMgKg: 0, doseMaxMgKg: 0, regimenDivisor: 1, concentrationMg: 0, concentrationMl: 1, bottleMl: 0, maxDoseMg: 0 },
  { id: "paracetamol", name: "Paracetamol", doseMinMgKg: 10, doseMaxMgKg: 15, regimenDivisor: 1, concentrationMg: 40, concentrationMl: 1, bottleMl: 85, maxDoseMg: 1000 },
  { id: "ibuprofeno", name: "Ibuprofeno", doseMinMgKg: 5, doseMaxMgKg: 10, regimenDivisor: 1, concentrationMg: 20, concentrationMl: 1, bottleMl: 200, maxDoseMg: 600 },
  { id: "amoxicilina", name: "Amoxicilina", doseMinMgKg: 25, doseMaxMgKg: 45, regimenDivisor: 2, concentrationMg: 250, concentrationMl: 5, bottleMl: 100, maxDoseMg: 875 },
  { id: "amoxicilina-otite", name: "Amoxicilina (otite)", doseMinMgKg: 80, doseMaxMgKg: 90, regimenDivisor: 2, concentrationMg: 500, concentrationMl: 5, bottleMl: 100, maxDoseMg: 875 },
  { id: "azitromicina", name: "Azitromicina", doseMinMgKg: 5, doseMaxMgKg: 10, regimenDivisor: 1, concentrationMg: 40, concentrationMl: 1, bottleMl: 30, maxDoseMg: 500 },
  { id: "cefatrizina", name: "Cefatrizina", doseMinMgKg: 20, doseMaxMgKg: 40, regimenDivisor: 3, concentrationMg: 50, concentrationMl: 1, bottleMl: 100, maxDoseMg: 1500 },
  { id: "cefixima", name: "Cefixima", doseMinMgKg: 8, doseMaxMgKg: 8, regimenDivisor: 1, concentrationMg: 20, concentrationMl: 1, bottleMl: 60, maxDoseMg: 400 },
  { id: "cefradina", name: "Cefradina", doseMinMgKg: 25, doseMaxMgKg: 50, regimenDivisor: 3, concentrationMg: 250, concentrationMl: 5, bottleMl: 120, maxDoseMg: 4000 },
  { id: "cefuroxima", name: "Cefuroxima", doseMinMgKg: 20, doseMaxMgKg: 40, regimenDivisor: 2, concentrationMg: 250, concentrationMl: 5, bottleMl: 100, maxDoseMg: 500 },
  { id: "trimetoprim-sulfametoxazol", name: "Trimetoprim + sulfametoxazol", doseMinMgKg: 8, doseMaxMgKg: 20, regimenDivisor: 2, concentrationMg: 40, concentrationMl: 5, bottleMl: 100, maxDoseMg: 160 },
  { id: "claritromicina", name: "Claritromicina", doseMinMgKg: 15, doseMaxMgKg: 15, regimenDivisor: 2, concentrationMg: 50, concentrationMl: 1, bottleMl: 100, maxDoseMg: 1000 },
  { id: "eritromicina", name: "Eritromicina", doseMinMgKg: 30, doseMaxMgKg: 50, regimenDivisor: 3, concentrationMg: 500, concentrationMl: 5, bottleMl: 100, maxDoseMg: 2000 },
  { id: "flucloxacilina", name: "Flucloxacilina", doseMinMgKg: 50, doseMaxMgKg: 200, regimenDivisor: 4, concentrationMg: 250, concentrationMl: 5, bottleMl: 100, maxDoseMg: 1500 },
  { id: "aciclovir", name: "Aciclovir", doseMinMgKg: 30, doseMaxMgKg: 80, regimenDivisor: 4, concentrationMg: 80, concentrationMl: 1, bottleMl: 100, maxDoseMg: 3200 },
  { id: "betametasona", name: "Betametasona", doseMinMgKg: 0.1, doseMaxMgKg: 0.25, regimenDivisor: 3, concentrationMg: 0.5, concentrationMl: 1, bottleMl: 30, maxDoseMg: 5 },
  { id: "hidroxizina", name: "Hidroxizina", doseMinMgKg: 2, doseMaxMgKg: 2, regimenDivisor: 3, concentrationMg: 2, concentrationMl: 1, bottleMl: 200, maxDoseMg: 100 },
  { id: "fluconazol", name: "Fluconazol", doseMinMgKg: 3, doseMaxMgKg: 12, regimenDivisor: 1, concentrationMg: 40, concentrationMl: 1, bottleMl: 35, maxDoseMg: 400 },
];
