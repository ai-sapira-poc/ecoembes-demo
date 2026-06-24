// Realistic Spanish FMCG/packaging companies (fictional but plausible)

export interface Empresa {
  nombre: string;
  cif: string;
  sector: string;
}

export const empresas: Empresa[] = [
  { nombre: "Conservas del Cantábrico S.A.",        cif: "A28541367", sector: "Alimentación" },
  { nombre: "Lácteos Valle Verde S.L.",              cif: "B31204985", sector: "Alimentación" },
  { nombre: "Aguas de Sierra Azul S.A.",             cif: "A46739210", sector: "Bebidas" },
  { nombre: "Bodegas Marqués de Tordella S.L.",      cif: "B26083741", sector: "Bebidas" },
  { nombre: "Higiene Natura Iberia S.A.",            cif: "A80127654", sector: "Droguería y perfumería" },
  { nombre: "Cosmética Piel Viva S.L.",              cif: "B58392014", sector: "Cosmética" },
  { nombre: "Distribuidora Central Peninsular S.A.", cif: "A63095482", sector: "Distribución" },
  { nombre: "Galletas y Cereales del Sur S.L.",      cif: "B41672309", sector: "Alimentación" },
  { nombre: "Zumos Naturales Ibéricos S.A.",         cif: "A50817423", sector: "Bebidas" },
  { nombre: "Limpieza Total Iberia S.L.",            cif: "B79346120", sector: "Droguería y perfumería" },
  { nombre: "Confitería Artesana Levante S.A.",      cif: "A12583960", sector: "Alimentación" },
  { nombre: "Cosméticos Mar de Plata S.L.",          cif: "B34705819", sector: "Cosmética" },
];
