const { Client } = require('discord.js-selfbot-v13');
const inquirer = require('inquirer');

async function main() {
  // Token'ı kullanıcıdan al
  const { token } = await inquirer.prompt([
    {
      type: 'input',
      name: 'token',
      message: 'Discord User Token\'ını girin:',
      validate: input => input.trim() !== '' || 'Token boş olamaz!'
    }
  ]);

  const client = new Client({ checkUpdate: false });

  client.on('ready', async () => {
    console.log(`Hesap hazır: ${client.user.tag}`);

    // Sunucuları listeleyelim
    const guilds = client.guilds.cache.map(g => ({ name: g.name, value: g.id }));
    if (guilds.length === 0) {
      console.log('Hiç sunucu bulunamadı. Çıkılıyor...');
      process.exit(0);
    }

    // Sunucu seçimi (modern dropdown)
    const { selectedGuildId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedGuildId',
        message: 'Takip etmek istediğin sunucuyu seçin:',
        choices: guilds
      }
    ]);

    const selectedGuild = client.guilds.cache.get(selectedGuildId);
    console.log(`Seçilen sunucu: ${selectedGuild.name}`);

    // Boost seviyesini kontrol fonksiyonu
    function checkBoost() {
      const boostLevel = selectedGuild.premiumSubscriptionCount || 0; // Boost sayısı
      const level = selectedGuild.premiumTier; // Tier seviyesi (0-3)

      console.log(`[LOG - ${new Date().toLocaleString()}] Sunucu: ${selectedGuild.name} | Boost Sayısı: ${boostLevel} | Tier: ${level}`);

      if (boostLevel < 14) {
        console.error(`[UYARI - ${new Date().toLocaleString()}] Boost seviyesi 14x altına düştü! Şu anki boost: ${boostLevel}`);
        // Burada ekstra bildirim ekleyebilirsin, örneğin email veya webhook ile.
      }
    }

    // İlk kontrol
    checkBoost();

    // Canlı takip: Her 5 dakikada bir kontrol et (300000 ms)
    setInterval(checkBoost, 300000);
  });

  // Login
  try {
    await client.login(token);
  } catch (error) {
    console.error('Token hatalı veya login sorunu:', error.message);
    process.exit(1);
  }
}

main();