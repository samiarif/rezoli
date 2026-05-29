/**
 * Seed the DB from the in-code catalog files. Idempotent (upsert).
 * Run via: pnpm db:seed
 */
import { PrismaClient, Prisma } from "@prisma/client";
import {
  services as codeServices,
  cocktailPacks,
  cafePacks,
  dejeunerPacks,
  streetfoodStations,
  cocktailCustomOptions,
  cafeCustomOptions,
  dejeunerOptions,
} from "../lib/service-catalog";
import { eventPackCategories as codePackCats } from "../lib/event-packs-catalog";
import {
  REZOLI_BLOG_POSTS,
  REZOLI_REALISATIONS,
} from "../lib/content-fixtures";

const prisma = new PrismaClient();

async function main() {
  console.log("[seed] services…");
  for (const [i, s] of codeServices.entries()) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      create: {
        slug: s.slug,
        name: s.name,
        shortName: s.shortName,
        tagline: s.tagline,
        description: s.description,
        longDescription: s.longDescription,
        highlights: s.highlights,
        minGuests: s.minGuests,
        startingPriceTND: s.startingPriceTND,
        badge: s.badge ?? null,
        imageUrl: s.image,
        imageAlt: s.imageAlt,
        order: i,
        published: true,
      },
      update: {
        name: s.name,
        shortName: s.shortName,
        tagline: s.tagline,
        description: s.description,
        longDescription: s.longDescription,
        highlights: s.highlights,
        minGuests: s.minGuests,
        startingPriceTND: s.startingPriceTND,
        badge: s.badge ?? null,
        imageUrl: s.image,
        imageAlt: s.imageAlt,
      },
    });
  }

  const cocktail = await prisma.service.findUnique({ where: { slug: "cocktails-dinatoires" } });
  const cafe = await prisma.service.findUnique({ where: { slug: "pauses-cafe" } });
  const dejeuner = await prisma.service.findUnique({ where: { slug: "pauses-dejeuner" } });
  const streetfood = await prisma.service.findUnique({ where: { slug: "stations-street-food" } });
  if (!cocktail || !cafe || !dejeuner || !streetfood) {
    throw new Error("Service rows missing after seed");
  }

  console.log("[seed] cocktail packs…");
  for (const [i, p] of cocktailPacks.entries()) {
    await prisma.servicePack.upsert({
      where: { serviceId_packKey: { serviceId: cocktail.id, packKey: p.id } },
      create: {
        serviceId: cocktail.id,
        packKey: p.id,
        name: p.name,
        badgeLabel: p.badgeLabel,
        order: i,
        content: {
          boissons: p.boissons,
          sale: p.sale,
          sucre: p.sucre,
          nbSale: p.nbSale,
          nbSucre: p.nbSucre,
          prix: p.prix,
        },
      },
      update: {
        name: p.name,
        badgeLabel: p.badgeLabel,
        content: {
          boissons: p.boissons,
          sale: p.sale,
          sucre: p.sucre,
          nbSale: p.nbSale,
          nbSucre: p.nbSucre,
          prix: p.prix,
        },
      },
    });
  }

  console.log("[seed] cafe packs…");
  for (const [i, p] of cafePacks.entries()) {
    await prisma.servicePack.upsert({
      where: { serviceId_packKey: { serviceId: cafe.id, packKey: p.id } },
      create: {
        serviceId: cafe.id,
        packKey: p.id,
        name: p.name,
        badgeLabel: p.badgeLabel,
        order: i,
        content: {
          boissons: p.boissons,
          sale: p.sale,
          sucre: p.sucre,
          prixSans: p.prixSans,
          prixAvec: p.prixAvec,
        },
      },
      update: {
        name: p.name,
        badgeLabel: p.badgeLabel,
        content: {
          boissons: p.boissons,
          sale: p.sale,
          sucre: p.sucre,
          prixSans: p.prixSans,
          prixAvec: p.prixAvec,
        },
      },
    });
  }

  console.log("[seed] dejeuner packs…");
  for (const [i, p] of dejeunerPacks.entries()) {
    await prisma.servicePack.upsert({
      where: { serviceId_packKey: { serviceId: dejeuner.id, packKey: p.id } },
      create: {
        serviceId: dejeuner.id,
        packKey: p.id,
        name: p.name,
        badgeLabel: p.badgeLabel,
        order: i,
        content: {
          entree: p.entree,
          plat: p.plat,
          dessert: p.dessert,
          boisson: p.boisson,
          lbPrix: p.lbPrix,
          tblPrix: p.tblPrix,
        },
      },
      update: {
        name: p.name,
        badgeLabel: p.badgeLabel,
        content: {
          entree: p.entree,
          plat: p.plat,
          dessert: p.dessert,
          boisson: p.boisson,
          lbPrix: p.lbPrix,
          tblPrix: p.tblPrix,
        },
      },
    });
  }

  console.log("[seed] custom options (cocktails)…");
  await prisma.serviceCustomOption.deleteMany({ where: { serviceId: cocktail.id } });
  for (const cat of ["boissons", "sale", "sucre"] as const) {
    const opts = cocktailCustomOptions[cat];
    for (const [i, label] of opts.entries()) {
      await prisma.serviceCustomOption.create({
        data: { serviceId: cocktail.id, category: cat, label, order: i },
      });
    }
  }

  console.log("[seed] custom options (cafe)…");
  await prisma.serviceCustomOption.deleteMany({ where: { serviceId: cafe.id } });
  for (const cat of ["boissons", "sale", "sucre"] as const) {
    const opts = cafeCustomOptions[cat];
    for (const [i, label] of opts.entries()) {
      await prisma.serviceCustomOption.create({
        data: { serviceId: cafe.id, category: cat, label, order: i },
      });
    }
  }

  console.log("[seed] custom options (dejeuner)…");
  await prisma.serviceCustomOption.deleteMany({ where: { serviceId: dejeuner.id } });
  for (const [i, label] of dejeunerOptions.boissons.entries()) {
    await prisma.serviceCustomOption.create({
      data: { serviceId: dejeuner.id, category: "boissons", label, order: i },
    });
  }

  console.log("[seed] stations…");
  for (const [i, st] of streetfoodStations.entries()) {
    await prisma.station.upsert({
      where: { serviceId_stationKey: { serviceId: streetfood.id, stationKey: st.id } },
      create: {
        serviceId: streetfood.id,
        stationKey: st.id,
        name: st.name,
        description: st.description,
        order: i,
        pricing: {
          prix: st.prix,
          variants: st.variants,
          multiVariant: st.multiVariant,
        },
      },
      update: {
        name: st.name,
        description: st.description,
        pricing: {
          prix: st.prix,
          variants: st.variants,
          multiVariant: st.multiVariant,
        },
      },
    });
  }

  console.log("[seed] event-pack categories…");
  for (const [i, cat] of codePackCats.entries()) {
    const upserted = await prisma.eventPackCategory.upsert({
      where: { slug: cat.slug },
      create: {
        slug: cat.slug,
        name: cat.name,
        description: cat.description,
        badge: cat.badge,
        tagline: cat.tagline,
        guestCountConfig: cat.guestCount,
        order: i,
        published: true,
      },
      update: {
        name: cat.name,
        description: cat.description,
        badge: cat.badge,
        tagline: cat.tagline,
        guestCountConfig: cat.guestCount,
      },
    });

    for (const [j, t] of cat.tiers.entries()) {
      await prisma.eventPackTier.upsert({
        where: { categoryId_tierKey: { categoryId: upserted.id, tierKey: t.id } },
        create: {
          categoryId: upserted.id,
          tierKey: t.id,
          badge: t.badge,
          name: t.name,
          description: t.description,
          content: t.content,
          price: t.price,
          order: j,
        },
        update: {
          badge: t.badge,
          name: t.name,
          description: t.description,
          content: t.content,
          price: t.price,
        },
      });
    }

    await prisma.eventPackOption.deleteMany({ where: { categoryId: upserted.id } });
    for (const [k, o] of cat.options.entries()) {
      await prisma.eventPackOption.create({
        data: {
          categoryId: upserted.id,
          optionKey: o.id,
          name: o.name,
          description: o.description ?? null,
          priceHT: o.priceHT,
          order: k,
        },
      });
    }
  }

  console.log("[seed] blog posts…");
  for (const b of REZOLI_BLOG_POSTS) {
    await prisma.blogPost.upsert({
      where: { slug: b.slug },
      create: {
        slug: b.slug,
        title: b.title,
        excerpt: b.excerpt,
        coverImageUrl: null,
        content: b.content as Prisma.InputJsonValue,
        tags: b.tags,
        status: "PUBLISHED",
        publishedAt: b.publishedAt,
        seoTitle: b.seoTitle,
        seoDescription: b.seoDescription,
      },
      update: {
        title: b.title,
        excerpt: b.excerpt,
        content: b.content as Prisma.InputJsonValue,
        tags: b.tags,
        status: "PUBLISHED",
        publishedAt: b.publishedAt,
        seoTitle: b.seoTitle,
        seoDescription: b.seoDescription,
      },
    });
  }

  console.log("[seed] réalisations…");
  for (const r of REZOLI_REALISATIONS) {
    await prisma.realisation.upsert({
      where: { slug: r.slug },
      create: {
        slug: r.slug,
        title: r.title,
        eventType: r.eventType,
        clientName: r.clientName,
        date: r.date,
        location: r.location,
        guestCount: r.guestCount,
        gallery: [],
        shortPitch: r.shortPitch,
        longContent: r.longContent as Prisma.InputJsonValue,
        outcomes: r.outcomes as unknown as Prisma.InputJsonValue,
        status: "PUBLISHED",
        publishedAt: r.date,
        featured: r.featured,
        order: r.order,
      },
      update: {
        title: r.title,
        eventType: r.eventType,
        clientName: r.clientName,
        date: r.date,
        location: r.location,
        guestCount: r.guestCount,
        shortPitch: r.shortPitch,
        longContent: r.longContent as Prisma.InputJsonValue,
        outcomes: r.outcomes as unknown as Prisma.InputJsonValue,
        status: "PUBLISHED",
        publishedAt: r.date,
        featured: r.featured,
        order: r.order,
      },
    });
  }

  console.log("[seed] done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
