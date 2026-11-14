package com.empreendesede.config;

import com.empreendesede.model.Company;
import com.empreendesede.model.UserAccount;
import com.empreendesede.repository.CompanyRepository;
import com.empreendesede.repository.UserRepository;
import com.empreendesede.service.PasswordHasher;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.util.List;

@Configuration
@Profile("dev")
public class DataSeeder {

    @Bean
    CommandLineRunner seedCompanies(
            CompanyRepository repository,
            UserRepository userRepository,
            PasswordHasher passwordHasher,
            @Value("${app.admin.email}") String adminEmail,
            @Value("${app.admin.password}") String adminPassword
    ) {
        return args -> {
            String normalizedAdminEmail = adminEmail.trim().toLowerCase();
            UserAccount admin = userRepository.findByEmailIgnoreCase(normalizedAdminEmail)
                    .orElseGet(() -> {
                        UserAccount created = new UserAccount();
                        created.setName("Administrador Único");
                        created.setEmail(normalizedAdminEmail);
                        created.setAuthProvider("LOCAL");
                        created.setRole("ADMIN");
                        return created;
                    });
            admin.setRole("ADMIN");
            admin.setPasswordHash(passwordHasher.hash(adminPassword));
            admin = userRepository.save(admin);

            if (repository.count() > 0) {
                return;
            }

            repository.saveAll(List.of(
                    // Mão de Obra (3 exemplos)
                    createSeedCompany(admin, "Sede Manutenção & Reparos", "Mão de Obra",
                            "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80",
                            "Serviços elétricos, hidráulicos, montagem de móveis e pequenos reparos residenciais e comerciais com garantia.",
                            "(11) 91234-5678", "5511912345678", "sedemanutencao.oficial"),
                    createSeedCompany(admin, "EletroForte Instalações", "Mão de Obra",
                            "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80",
                            "Instalação de ar-condicionado, quadros elétricos, tomadas e iluminação LED com atendimento rápido em toda a cidade.",
                            "(11) 93456-7810", "5511934567810", "eletroforte.sede"),
                    createSeedCompany(admin, "Marcenaria Tradição & Sob Medida", "Mão de Obra",
                            "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80",
                            "Móveis planejados, restauração em madeira maciça, portas e painéis ripados feitos sob medida para sua casa ou loja.",
                            "(11) 94567-8912", "5511945678912", "marcenariatradicao"),
                    // Comércio (3 exemplos)
                    createSeedCompany(admin, "Verde Vida Hortifrúti", "Comércio",
                            "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
                            "Produtos orgânicos frescos direto do produtor, cestas semanais por assinatura e entregas rápidas na região.",
                            "(11) 97766-5544", "5511977665544", "verdevida.organicos"),
                    createSeedCompany(admin, "TechLocal Informática & Celulares", "Comércio",
                            "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80",
                            "Acessórios para celular, periféricos, notebooks e assistência técnica especializada com peças originais e garantia.",
                            "(11) 99123-4501", "5511991234501", "techlocal.sede"),
                    createSeedCompany(admin, "Empório da Serra Mercearia", "Comércio",
                            "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80",
                            "Queijos artesanais, cafés especiais, temperos naturais, bebidas e produtos coloniais selecionados diariamente.",
                            "(11) 98234-5602", "5511982345602", "emporiodaserra.loja"),
                    // Gastronomia (3 exemplos)
                    createSeedCompany(admin, "Café & Prosa Artesanal", "Gastronomia",
                            "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80",
                            "Cafeteria especializada em grãos selecionados, pães de fermentação natural e um espaço acolhedor para reuniões e trabalho remoto.",
                            "(11) 98765-4321", "5511987654321", "cafeprosa.artesanal"),
                    createSeedCompany(admin, "Forno Nobre Pizzaria & Massas", "Gastronomia",
                            "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80",
                            "Pizzas artesanais assadas em forno a lenha com massa de longa fermentação, massas frescas e delivery próprio.",
                            "(11) 97345-6703", "5511973456703", "fornonobre.pizzas"),
                    createSeedCompany(admin, "Doce Encanto Confeitaria", "Gastronomia",
                            "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80",
                            "Bolos artesanais para festas, doces finos, tortas geladas e kits personalizados para eventos e encomendas.",
                            "(11) 96456-7804", "5511964567804", "doceencanto.confeitaria"),
                    // Beleza (Masculina/Feminina) (3 exemplos)
                    createSeedCompany(admin, "Espaço Raiz Beleza & Barbearia", "Beleza (Masculina/Feminina)",
                            "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80",
                            "Cortes masculinos e femininos, barba, coloração, escova e estética facial com horário agendado.",
                            "(11) 99887-7665", "5511998877665", "espacoraiz.beleza"),
                    createSeedCompany(admin, "Barbearia Dom Pedro", "Beleza (Masculina/Feminina)",
                            "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=600&q=80",
                            "Corte masculino clássico e degradê, barboterapia com toalha quente e cuidados completos para o visual masculino.",
                            "(11) 95567-8905", "5511955678905", "barbeariadompedro"),
                    createSeedCompany(admin, "Studio Bela Essência", "Beleza (Masculina/Feminina)",
                            "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80",
                            "Manicure, pedicure, design de sobrancelhas, alongamento de cílios e maquiagem social em ambiente climatizado.",
                            "(11) 94678-9006", "5511946789006", "studiobelaessencia"),
                    // Vestuário (3 exemplos)
                    createSeedCompany(admin, "Ateliê & Moda Local", "Vestuário",
                            "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80",
                            "Roupas casuais masculinas e femininas, confecção própria, ajustes sob medida e peças exclusivas.",
                            "(11) 96543-2109", "5511965432109", "ateliemodalocal"),
                    createSeedCompany(admin, "Urbano Fit & Esportes", "Vestuário",
                            "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=600&q=80",
                            "Moda fitness, camisetas dry-fit, conjuntos esportivos masculinos e femininos e acessórios para treino e corrida.",
                            "(11) 93789-0107", "5511937890107", "urbanofit.sede"),
                    createSeedCompany(admin, "Villa Jeans & Casual", "Vestuário",
                            "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80",
                            "Calças jeans premium, jaquetas, camisas sociais e looks casuais completos com variedade de numerações.",
                            "(11) 92890-1208", "5511928901208", "villajeans.oficial")
            ));
        };
    }

    private Company createSeedCompany(
            UserAccount admin,
            String name,
            String category,
            String logoUrl,
            String description,
            String phone,
            String whatsapp,
            String instagram
    ) {
        Company company = new Company();
        company.setName(name);
        company.setCategory(category);
        company.setLogoUrl(logoUrl);
        company.setDescription(description);
        company.setPhone(phone);
        company.setWhatsapp(whatsapp);
        company.setInstagram(instagram);
        company.setOwnerId(admin.getId());
        company.setOwnerEmail(admin.getEmail());
        company.setApproved(true);
        company.setPaymentStatus("EXEMPT");
        return company;
    }
}
