// src/lib/pixGenerator.ts
// Gerador de código PIX seguindo o padrão do Banco Central

interface PixData {
  pixKey: string;
  description: string;
  merchantName: string;
  merchantCity: string;
  amount: number;
  txid?: string;
}

class PixGenerator {
  private crc16(payload: string): string {
    let crc = 0xFFFF;
    
    for (let i = 0; i < payload.length; i++) {
      crc ^= payload.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        if (crc & 0x8000) {
          crc = (crc << 1) ^ 0x1021;
        } else {
          crc = crc << 1;
        }
      }
    }
    
    return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
  }

  private formatValue(id: string, value: string): string {
    const size = value.length.toString().padStart(2, '0');
    return `${id}${size}${value}`;
  }

  generate(data: PixData): string {
    const {
      pixKey,
      description,
      merchantName,
      merchantCity,
      amount,
      txid
    } = data;

    // Payload Format Indicator
    let payload = this.formatValue('00', '01');

    // Merchant Account Information
    let merchantAccount = this.formatValue('00', 'BR.GOV.BCB.PIX');
    merchantAccount += this.formatValue('01', pixKey);
    
    if (description) {
      merchantAccount += this.formatValue('02', description);
    }

    payload += this.formatValue('26', merchantAccount);

    // Merchant Category Code (não especificado)
    payload += this.formatValue('52', '0000');

    // Transaction Currency (986 = BRL)
    payload += this.formatValue('53', '986');

    // Transaction Amount
    if (amount > 0) {
      payload += this.formatValue('54', amount.toFixed(2));
    }

    // Country Code
    payload += this.formatValue('58', 'BR');

    // Merchant Name
    payload += this.formatValue('59', merchantName.substring(0, 25));

    // Merchant City
    payload += this.formatValue('60', merchantCity.substring(0, 15));

    // Additional Data Field Template
    if (txid) {
      const additionalData = this.formatValue('05', txid.substring(0, 25));
      payload += this.formatValue('62', additionalData);
    }

    // CRC16
    payload += '6304';
    const crc = this.crc16(payload);
    payload += crc;

    return payload;
  }

  // Função auxiliar para validar chave PIX
  validatePixKey(key: string): { valid: boolean; type: string } {
    // Remove espaços
    key = key.trim();

    // Validar CPF (11 dígitos)
    if (/^\d{11}$/.test(key)) {
      return { valid: true, type: 'CPF' };
    }

    // Validar CNPJ (14 dígitos)
    if (/^\d{14}$/.test(key)) {
      return { valid: true, type: 'CNPJ' };
    }

    // Validar telefone (+5511999999999)
    if (/^\+55\d{10,11}$/.test(key)) {
      return { valid: true, type: 'Telefone' };
    }

    // Validar email
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(key)) {
      return { valid: true, type: 'Email' };
    }

    // Validar chave aleatória (UUID)
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(key)) {
      return { valid: true, type: 'Chave Aleatória' };
    }

    return { valid: false, type: 'Inválida' };
  }
}

export const pixGenerator = new PixGenerator();