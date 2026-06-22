const fs = require('fs');

// Вставьте сюда содержимое вашего JSON-файла
const json = {
  "type": "service_account",
  "project_id": "servicebox35-e242f",
  "private_key_id": "164cce92ff9f117b1e80be7102ae36eee1391107",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCveo5k4l5UwsUe\nQvedwrdb/59txLh6gDURPsYTdRl2fIC6hbTM9YrcR6oaHG1n1RYsCTLM9vudFyJR\ne7gX7HbSViJ5UE5oW2f/TyIZihdf/8ipKn/zidRCxAlZHaQvs58EQNmtPYXmzBM6\nSpcXZaSxZV77hgZILWqQfLny1Bmpinbs2qcrLKVjDradUkhaLPp9WzJOSWugf5Ma\n9D56lU3Bg6y1u3IE0/0uJqcUY0VqRNq/QDuC3GJORWCw/CTr0dOugAyFtfypIDt9\n9KyvdIjx603hCCgSC3Xc92Jky69GsraiA8zg0dx5L1mhstoOEmtHIEYpVxDWHPXo\nruAl/5bhAgMBAAECggEAEsQr0ciut2hb/dRCGHZQNy/DfFD/PKSU6Er7Em4hwrzm\nZGwzrX6t8shcPe4f2iyc8ikqrGZWetKUSjwNsEtK2sw45BntRLZPzStIlYwh21Om\nwUapB+HL2DcQW94yZqKSRTltPhx4Azp8bO24slkdr5YMfiAzcEkhHiIknb5Gn02g\n+INAqDVbHl8Ofupi4+KVqQ9GvvZtlylbGB0+xQ2+g8CBb9g0ZlujeOsg8eQrVfjW\ngc4/HcX1oxmyHRd4hUosgDzBvEyCTrZ5ecCk0+aGMxBJDZZ+LHVjCbCSjVn/rmko\nm+ng8YrpTlnfsMwgqd+zv+XkYiMUC3gjnswd3KEXpQKBgQDZc67M2K+nvHlzIYBu\nstUdvMEhL0BcWtNxS2LE1YVWpEVlHN9CCn3WWhgm1qvIlVX311v7Vd68Xnr4ApPM\nrOzsd9hql3DozWwYcY/PC54BjSME0lozcheQA7gzDiB4kFB199secyFIxBAv/fC/\nl212d1jfu1a2ofDoMiog+LE73QKBgQDOlhBsxhLVwZsRIkf2oIEy3Z+1RLk/uGbc\nWVluPOGX5EV+6WdExJQNAKaiwdg01+wCve632gm7fBVHZ6nJINE0hgZopazQ5fwH\n8CC5WZrS6FJEL49mvgLfoJdgbpUKl7U/X+AEwDmb44oXH74Rlm+RwlwRZ+Al87KH\nb/qHByNo1QKBgQDNPrWEwBm79tejZcG1urIRKXIZAmJ7SXc9/muxYeBDETY24/OO\ngByaT9tv/TuTTfEgx3MYXcqofX0Pzk7251mRMOViZqK5+frHb5jPUiXHTRH6oRlm\naY/37KrV9cWMRprLXjDCIuUNq5Gj2sp77E/ze161fjuwklWytHazPEj9OQKBgQCB\ngigH2OCj6ryIsEIHBbYZKkDeBZhQrwyk5Mqgxj/y1eMPXckknkvmHttYO0eMUTSe\nv20xCtqBE5fPbNhOw2kDkWXhIsPFLfijDVGmgNsDjytLnbk7grEQen+Lr6d1vYed\nlEA/GjbDWJEQUBD6u6Fz8jF/o+wsPqtUJsoa7kmvhQKBgQCcIPOL+1CCppRNdMkA\nE6y4jp3lmGxrgEr7kgg2QL5FTQWNLX4/47xYYwZv1sUqCuqBfhIPV+8VWkvDOmK3\nY5h2vnmtqlSf9CHR633cVi0A/70EeGpHCYnyxk5tFZvwY8MAPYUQdoXi50lkpuGg\nadr1M93wKygIFVikqJBK08hkug==\n-----END PRIVATE KEY-----\n",
  "client_email": "servicebox-wallet@servicebox35-e242f.iam.gserviceaccount.com",
  "client_id": "102072761690983400076",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/servicebox-wallet%40servicebox35-e242f.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

// Преобразуем в одну строку
const formatted = JSON.stringify(json);
console.log(formatted);
