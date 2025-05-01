// lib/template-utils.ts
export const getEmptyTemplate = (type: string): string => {
    const templates = {
      invoice: `
        <div class="p-8">
          <h1 class="text-2xl font-bold">FACTURE #{{number}}</h1>
          <p class="text-gray-500">Date: {{date}}</p>
          <!-- Structure de facture vide -->
          <table class="w-full mt-4">
            <thead>
              <tr class="border-b">
                <th class="text-left pb-2">Description</th>
                <th class="text-right pb-2">Quantité</th>
                <th class="text-right pb-2">Prix unitaire</th>
                <th class="text-right pb-2">Total</th>
              </tr>
            </thead>
            <tbody>
              <!-- Lignes dynamiques ici -->
            </tbody>
          </table>
        </div>
      `,
      quotation: `
        <div class="p-8">
          <h1 class="text-2xl font-bold">DEVIS #{{number}}</h1>
          <!-- Structure de devis vide -->
        </div>
      `,
      payment: `
        <div class="p-8">
          <h1 class="text-2xl font-bold">PAIEMENT #{{number}}</h1>
          <!-- Structure de paiement vide -->
        </div>
      `
    };
  
    return templates[type as keyof typeof templates] || '';
  };