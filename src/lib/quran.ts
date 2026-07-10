
export interface QuranMeta {
  number: number;
  name: string;
  numberOfAyahs: number;
}

export interface Ayah {
  numberInSurah: number;
  text: string;
  surahNumber: number;
}

export const fetchSurahsMeta = async (): Promise<QuranMeta[]> => {
  const response = await fetch('https://api.alquran.cloud/v1/meta');
  const data = await response.json();
  return data.data.surahs.references;
};

export const fetchAyahRange = async (startSurah: number, startAyah: number, endSurah: number, endAyah: number): Promise<Ayah[]> => {
  let allAyahs: Ayah[] = [];
  for (let s = startSurah; s <= endSurah; s++) {
    const response = await fetch(`https://api.alquran.cloud/v1/surah/${s}/quran-uthmani`);
    const data = await response.json();
    let ayahs = data.data.ayahs;
    
    if (s === startSurah && s === endSurah) {
      ayahs = ayahs.filter((a: any) => a.numberInSurah >= startAyah && a.numberInSurah <= endAyah);
    } else if (s === startSurah) {
      ayahs = ayahs.filter((a: any) => a.numberInSurah >= startAyah);
    } else if (s === endSurah) {
      ayahs = ayahs.filter((a: any) => a.numberInSurah <= endAyah);
    }
    
    allAyahs = allAyahs.concat(ayahs.map((a: any) => ({
      numberInSurah: a.numberInSurah,
      text: a.text,
      surahNumber: s
    })));
  }
  return allAyahs;
};
