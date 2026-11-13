package com.empreendesede.config;

import com.empreendesede.model.Company;
import com.empreendesede.repository.CompanyRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.util.List;

@Configuration
@Profile("dev")
public class DataSeeder {

    @Bean
    CommandLineRunner seedCompanies(CompanyRepository repository) {
        return args -> {
            if (repository.count() > 0) {
                return;
            }

            Company c1 = new Company();
            c1.setName("Café & Prosa Artesanal");
            c1.setCategory("Gastronomia");
            c1.setLogoUrl("https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80");
            c1.setDescription("Cafeteria especializada em grãos selecionados, pães de fermentação natural e um espaço acolhedor para reuniões e trabalho remoto.");
            c1.setPhone("(11) 98765-4321");
            c1.setWhatsapp("5511987654321");
            c1.setInstagram("cafeprosa.artesanal");

            Company c2 = new Company();
            c2.setName("Sede Tech Soluções");
            c2.setCategory("Tecnologia");
            c2.setLogoUrl("https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80");
            c2.setDescription("Desenvolvimento de sistemas sob medida, automação comercial e suporte técnico especializado para pequenos e médios negócios.");
            c2.setPhone("(11) 91234-5678");
            c2.setWhatsapp("5511912345678");
            c2.setInstagram("sedetech.oficial");

            Company c3 = new Company();
            c3.setName("Estúdio Raiz Design");
            c3.setCategory("Design & Marketing");
            c3.setLogoUrl("https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=600&q=80");
            c3.setDescription("Identidade visual, gestão de redes sociais e fotografia comercial para impulsionar marcas locais com criatividade.");
            c3.setPhone("(11) 99887-7665");
            c3.setWhatsapp("5511998877665");
            c3.setInstagram("estudioraiz.design");

            Company c4 = new Company();
            c4.setName("Verde Vida Hortifrúti");
            c4.setCategory("Comércio Local");
            c4.setLogoUrl("https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80");
            c4.setDescription("Produtos orgânicos frescos direto do produtor, cestas semanais por assinatura e entregas rápidas na região.");
            c4.setPhone("(11) 97766-5544");
            c4.setWhatsapp("5511977665544");
            c4.setInstagram("verdevida.organicos");

            repository.saveAll(List.of(c1, c2, c3, c4));
        };
    }
}
