const fs = require('fs');
const file = 'lib/api-client-react/src/generated/api.schemas.ts';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(/export interface StatGroup \{/, 'export interface StatGroup {\n  sapma?: number;');
c = c.replace(/export interface AnalizOzet \{/, 'export interface AnalizOzet {\n  effective_sample_size?: number;');
c = c.replace(/export interface TabloSatiri \{/, 'export interface TabloSatiri {\n  lig_isim?: string;\n  tarih_format?: string;');
c = c.replace(/export interface TarafOranlari \{/, 'export interface TarafOranlari {\n  ev_kapanis?: string;\n  ber_kapanis?: string;\n  dep_kapanis?: string;\n  ev_trend?: string;\n  ber_trend?: string;\n  dep_trend?: string;');
c = c.replace(/export interface AltUst \{/, 'export interface AltUst {\n  alt_kapanis?: string;\n  ust_kapanis?: string;\n  alt_trend?: string;\n  ust_trend?: string;');

fs.writeFileSync(file, c, 'utf8');
