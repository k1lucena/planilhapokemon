import { useState, useEffect } from 'react';

import { PokemonData, PokemonEvolution } from '@/lib/types';

const cache = new Map<string, PokemonData>();

async function fetchEvolutionChain(pokemonName: string): Promise<PokemonEvolution[]> {
  try {
    const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonName}`);
    if (!speciesRes.ok) return [];
    const speciesData = await speciesRes.json();

    const evoRes = await fetch(speciesData.evolution_chain.url);
    if (!evoRes.ok) return [];
    const evoData = await evoRes.json();

    const evolutions: PokemonEvolution[] = [];
    let current = evoData.chain;

    while (current) {
      const name = current.species.name;
      const pokeRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
      if (pokeRes.ok) {
        const pokeData = await pokeRes.json();
        const animated = pokeData.sprites?.versions?.['generation-v']?.['black-white']?.animated?.front_default;
        evolutions.push({
          name,
          sprite: pokeData.sprites.other?.['official-artwork']?.front_default || pokeData.sprites.front_default || '',
          animatedSprite: animated || '',
        });
      }
      current = current.evolves_to?.[0] || null;
    }

    return evolutions;
  } catch {
    return [];
  }
}

export function usePokemonData(pokemonNames: string[]) {
  const [pokemonMap, setPokemonMap] = useState<Map<string, PokemonData>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (pokemonNames.length === 0) return;

    const uniqueNames = [...new Set(pokemonNames.filter(Boolean))];
    let cancelled = false;

    async function loadAll() {
      setIsLoading(true);
      const newMap = new Map<string, PokemonData>(cache);

      const toFetch = uniqueNames.filter(n => !cache.has(n));
      
      await Promise.all(
        toFetch.map(async (name) => {
          try {
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
            if (!res.ok) return;
            const data = await res.json();

            const evolutions = await fetchEvolutionChain(name);
            const animated = data.sprites?.versions?.['generation-v']?.['black-white']?.animated?.front_default;

            const pokemonData: PokemonData = {
              id: data.id,
              name: data.name,
              sprite: data.sprites.other?.['official-artwork']?.front_default || data.sprites.front_default || '',
              evolutions: evolutions.length > 0 ? evolutions : [{
                name: data.name,
                sprite: data.sprites.other?.['official-artwork']?.front_default || data.sprites.front_default || '',
                animatedSprite: animated || '',
              }],
            };

            cache.set(name, pokemonData);
            newMap.set(name, pokemonData);
          } catch {
            // skip
          }
        })
      );

      if (!cancelled) {
        for (const name of uniqueNames) {
          if (cache.has(name) && !newMap.has(name)) {
            newMap.set(name, cache.get(name)!);
          }
        }
        setPokemonMap(new Map(newMap));
        setIsLoading(false);
      }
    }

    loadAll();
    return () => { cancelled = true; };
  }, [pokemonNames.join(',')]);

  return { pokemonMap, isLoading };
}
