
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, cpf, email, phone, amount, productName, referenceId } = req.body;

  try {
    const apiKey = process.env.PARADISE_KEY;
    if (!apiKey) {
      console.error("ERRO: Variável de ambiente PARADISE_KEY não configurada");
      return res.status(500).json({ error: 'Erro de configuração do servidor' });
    }

    const orderReference = (referenceId ? String(referenceId) : `PEDIDO${Date.now()}`).replace(/[^a-zA-Z0-9]/g, '');
    const parsedAmount = Number(amount) || 0;
    const amountInCents = Math.round(parsedAmount * 100); // Paradise Pags espera centavos (inteiro)

    const payload = {
      productHash: process.env.VITE_PARADISE_PRODUCT_HASH || "prod_cdf8c019ba3ce3cf",
      amount: amountInCents,
      description: (productName || "Pedido Vapex").substring(0, 255),
      reference: orderReference,
      customer: {
        name: name || "Cliente Vapex",
        email: email || "cliente@vapex.com",
        phone: phone ? phone.replace(/\D/g, "") : "11999999999",
        document: cpf ? cpf.replace(/\D/g, "") : "",
      },
    };

    console.log(`Gerando PIX Paradise Pags - Valor: R$${parsedAmount} (${amountInCents} centavos) - Pedido: ${orderReference}`);

    const response = await fetch("https://multi.paradisepags.com/api/v1/transaction.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();
    console.log("--- RESPOSTA PARADISE PAGS ---", responseData);

    if (
      response.ok &&
      (responseData.status === "success" ||
        responseData.status === "pending" ||
        responseData.pix_code ||
        responseData.qr_code)
    ) {
      return res.status(200).json({
        status: "success",
        transaction_id: responseData.transaction_id || responseData.id || responseData.order_id,
        reference: responseData.reference || orderReference,
        pix_code:
          responseData.pix_code ||
          responseData.qr_code ||
          responseData.copy_paste ||
          responseData.emv ||
          responseData.payload ||
          responseData.code,
        pix_qr_code:
          responseData.pix_qr_code ||
          responseData.qr_code_base64 ||
          responseData.qrcode_base64 ||
          responseData.image_base64 ||
          responseData.qrcode_url ||
          responseData.image_url ||
          (responseData.qr_code ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(responseData.qr_code)}` : null),
        amount: amount,
        expires_at: responseData.expires_at,
      });
    } else {
      console.error("Erro na resposta da Paradise Pags:", responseData);
      return res.status(400).json({
        error: responseData.message || responseData.error || "Falha ao processar o pagamento"
      });
    }
  } catch (error) {
    console.error("Erro interno na API de PIX:", error);
    return res.status(500).json({ error: error.message || "Erro interno do servidor" });
  }
}
