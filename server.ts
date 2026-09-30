import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Gemini Client with User-Agent header
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Health check endpoint with school identity
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    appName: 'SISWA KREATIF DENGAN GAME KREATIF',
    madrasah: 'MIN 1 PASER',
    kepalaMadrasah: 'Ismail, S.Ag',
    pengembang: 'Dzakirul Husni, S.Pd',
    timestamp: new Date().toISOString(),
    aiConfigured: Boolean(apiKey),
  });
});

// AI Question Generator Endpoint
app.post('/api/gemini/generate-questions', async (req, res) => {
  try {
    const {
      subject = 'Akidah Akhlak',
      grade = '4',
      difficulty = 'sedang',
      count = 5,
      topic = 'Ibadah dan Nilai Kehidupan',
      context = ''
    } = req.body;

    const requestedCount = Math.min(Math.max(Number(count) || 5, 1), 15);

    if (ai) {
      const prompt = `Buatlah ${requestedCount} butir soal pilihan ganda (A, B, C, D) interaktif dan mendidik untuk siswa Madrasah Ibtidaiyah (MIN 1 PASER) Kalimantan Timur.
Mata Pelajaran: ${subject}
Tingkat Kelas: Kelas ${grade} Madrasah Ibtidaiyah (Usia 7-12 tahun)
Tingkat Kesulitan: ${difficulty} (mudah/sedang/sulit_hots)
Topik Spesifik: ${topic}
${context ? `Konteks Tambahan: ${context}` : ''}

Ketentuan Khusus Soal:
1. Soal harus edukatif, inspiratif, membangun nalar kritis, dan sesuai kurikulum Kemenag RI / Kurikulum Merdeka.
2. Setiap soal wajib memiliki 4 opsi jawaban (A, B, C, D) yang jelas.
3. Kunci jawaban (correctOption) harus pasti salah satu dari 'A', 'B', 'C', atau 'D'.
4. Sertakan penjelasan edukatif (explanation) yang ramah anak, mudah dimengerti, dan memotivasi belajar.
5. Alokasi waktu pengerjaan 25-45 detik dan poin 10-20.
6. Kembalikan dalam format JSON murni sesuai skema.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'Anda adalah Pakar Kurikulum dan Pembuat Soal Cerdas Cermat Kreatif untuk Madrasah Ibtidaiyah Negeri 1 Paser (MIN 1 PASER). Buat soal yang menarik, berbobot, akurat secara keilmuan Islam dan sains modern, serta relevan untuk siswa.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                questionText: { type: Type.STRING },
                optionA: { type: Type.STRING },
                optionB: { type: Type.STRING },
                optionC: { type: Type.STRING },
                optionD: { type: Type.STRING },
                correctOption: { type: Type.STRING, description: 'Harus A, B, C, atau D' },
                explanation: { type: Type.STRING },
                points: { type: Type.INTEGER },
                timeLimitSeconds: { type: Type.INTEGER },
              },
              required: ['questionText', 'optionA', 'optionB', 'optionC', 'optionD', 'correctOption', 'explanation', 'points', 'timeLimitSeconds'],
            },
          },
        },
      });

      const text = response.text || '[]';
      const parsed = JSON.parse(text);

      const formattedQuestions = parsed.map((item: any, idx: number) => ({
        id: `ai-${Date.now()}-${idx + 1}`,
        questionText: item.questionText,
        optionA: item.optionA,
        optionB: item.optionB,
        optionC: item.optionC,
        optionD: item.optionD,
        correctOption: ['A', 'B', 'C', 'D'].includes(item.correctOption?.toUpperCase()) ? item.correctOption.toUpperCase() : 'A',
        explanation: item.explanation || 'Pembahasan materi untuk siswa kreatif MIN 1 Paser.',
        points: Number(item.points) || 10,
        timeLimitSeconds: Number(item.timeLimitSeconds) || 30,
        subject: subject,
        grade: String(grade),
        difficulty: difficulty,
        isAiGenerated: true,
      }));

      return res.json({
        success: true,
        source: 'gemini-3.8-flash',
        count: formattedQuestions.length,
        questions: formattedQuestions,
      });
    }

    // Fallback: Smart Generator if API key is pending or offline
    const fallbackQuestions = generateSmartFallbackQuestions(subject, grade, difficulty, requestedCount, topic);
    return res.json({
      success: true,
      source: 'smart-curriculum-engine',
      count: fallbackQuestions.length,
      questions: fallbackQuestions,
      note: 'Menggunakan generator cerdas kurikulum MIN 1 Paser terstandar.',
    });
  } catch (error: any) {
    console.error('Error generating AI questions:', error);
    // Even in error, provide reliable educational questions so the game never stalls
    const fallbackQuestions = generateSmartFallbackQuestions(
      req.body.subject || 'Akidah Akhlak',
      req.body.grade || '4',
      req.body.difficulty || 'sedang',
      req.body.count || 5,
      req.body.topic || 'Pembelajaran Tematik'
    );
    return res.json({
      success: true,
      source: 'fallback-resilience',
      count: fallbackQuestions.length,
      questions: fallbackQuestions,
    });
  }
});

// Helper for smart educational questions
function generateSmartFallbackQuestions(subject: string, grade: string, difficulty: string, count: number, topic: string) {
  const isIpasGrade6 = String(grade) === '6' && (subject.includes('IPAS') || subject.includes('Sains'));

  const ipas6Templates = [
    {
      q: `Dalam materi IPAS Kelas 6 tentang sistem gerak manusia, sendi yang memungkinkan gerakan memutar pada tulang leher dan tengkorak kepala adalah...`,
      a: 'Sendi Putar',
      b: 'Sendi Engsel',
      c: 'Sendi Peluru',
      d: 'Sendi Pelana',
      correct: 'A',
      exp: 'Sendi putar memungkinkan satu tulang berputar mengitari poros tulang lainnya, contohnya sendi antara tulang atlas dan tengkorak.',
    },
    {
      q: `Peristiwa alam di bawah ini yang merupakan akibat langsung dari perputaran Bumi pada porosnya (Rotasi Bumi) selama 24 jam adalah...`,
      a: 'Pergantian siang dan malam serta perbedaan waktu antardaerah',
      b: 'Pergantian musim semi dan gugur',
      c: 'Perubahan rasi bintang sepanjang tahun',
      d: 'Gerhana matahari total',
      correct: 'A',
      exp: 'Rotasi bumi menyebabkan belahan bumi mengalami siang dan malam secara bergantian serta pembagian zona waktu bujur.',
    },
    {
      q: `Planet terbesar dalam sistem Tata Surya kita yang memiliki banyak satelit alami dan terkenal dengan Bintik Merah Raksasa adalah...`,
      a: 'Jupiter',
      b: 'Saturnus',
      c: 'Mars',
      d: 'Neptunus',
      correct: 'A',
      exp: 'Jupiter adalah planet gas raksasa terbesar di tata surya dengan diameter lebih dari 11 kali diameter bumi.',
    },
    {
      q: `Indonesia merupakan salah satu negara pelopor berdirinya ASEAN. Manakah di bawah ini peran positif Indonesia dalam kerja sama internasional di bidang pelestarian lingkungan?`,
      a: 'Menjaga dan merehabilitasi hutan hujan tropis serta ekosistem mangrove di Kalimantan Timur',
      b: 'Menebang hutan mangrove di pesisir Paser untuk perumahan liar',
      c: 'Mengimpor sampah plastik dari negara lain',
      d: 'Membiarkan pencemaran di Sungai Kandilo',
      correct: 'A',
      exp: 'Hutan hujan tropis Kalimantan dan ekosistem mangrove berperan vital sebagai penyerap karbon global dalam kerja sama ASEAN & dunia.',
    },
    {
      q: `Sumber energi terbarukan yang sangat potensial dikembangkan di wilayah Kabupaten Paser dan Kalimantan Timur karena ketersediaan sinar melimpah sepanjang tahun adalah...`,
      a: 'Pembangkit Listrik Tenaga Surya (PLTS)',
      b: 'Bahan bakar batu bara terus-menerus',
      c: 'Tenaga nuklir uranium',
      d: 'Minyak bumi mentah',
      correct: 'A',
      exp: 'Energi surya (cahaya matahari) merupakan energi terbarukan yang bersih, ramah lingkungan, dan tidak menghasilkan polusi gas rumah kaca.',
    },
    {
      q: `Ketika terjadi Gerhana Matahari, bagaimanakah posisi matahari, bumi, dan bulan di angkasa?`,
      a: 'Posisi Bulan berada tepat di antara Matahari dan Bumi dalam satu garis lurus',
      b: 'Posisi Bumi berada di antara Matahari dan Bulan',
      c: 'Matahari berada di antara Bumi dan Bulan',
      d: 'Bulan berada di belakang orbit planet Mars',
      correct: 'A',
      exp: 'Pada gerhana matahari, Bulan menghalangi cahaya matahari yang menuju ke bumi sehingga bayangan bulan jatuh ke permukaan bumi.',
    }
  ];

  const genericTemplates = [
    {
      q: `Dalam materi ${subject} Kelas ${grade}, nilai utama yang harus ditanamkan siswa MIN 1 Paser dalam kehidupan sehari-hari adalah...`,
      a: 'Kejujuran, kedisiplinan, dan tanggung jawab',
      b: 'Mementingkan kepentingan diri sendiri',
      c: 'Menunda-nunda tugas madrasah',
      d: 'Berputus asa jika menghadapi kesulitan',
      correct: 'A',
      exp: 'Karakter utama siswa madrasah adalah menjunjung tinggi nilai kejujuran, disiplin, dan akhlak mulia.',
    },
    {
      q: `Bagaimanakah penerapan ${topic} yang paling tepat saat belajar bersama kelompok cerdas cermat?`,
      a: 'Saling menyalahkan ketika salah menjawab',
      b: 'Bekerja sama, menghargai pendapat, dan saling menyemangati',
      c: 'Hanya satu orang saja yang boleh berpikir',
      d: 'Mengabaikan petunjuk dari bapak/ibu guru',
      correct: 'B',
      exp: 'Kekuatan kelompok terletak pada kerja sama tim yang kompak dan saling menghargai nalar kawan.',
    },
    {
      q: `Sebagai siswa MIN 1 Paser yang kreatif, jika menemukan persoalan ${subject} yang menantang, langkah terbaik adalah...`,
      a: 'Langsung menyerah tanpa mencoba',
      b: 'Menganalisis masalah dengan nalar kritis, berdiskusi, dan mencari solusi ilmiah',
      c: 'Menyalin jawaban teman tanpa memahami',
      d: 'Membiarkan soal tidak terjawab',
      correct: 'B',
      exp: 'Nalar kritis dan kemampuan memecahkan masalah adalah esensi pembelajaran Kurikulum Merdeka di madrasah.',
    },
    {
      q: `Mengapa kita harus senantiasa menjaga kelestarian lingkungan alam di Kabupaten Paser Kalimantan Timur?`,
      a: 'Agar udara tetap bersih, air jernih, dan ekosistem terjaga sebagai amanah Allah',
      b: 'Supaya lahan bisa ditebang sesuka hati',
      c: 'Hanya untuk dinilai oleh guru saat lomba',
      d: 'Agar Sungai Kandilo semakin dangkal',
      correct: 'A',
      exp: 'Menjaga alam semesta merupakan wujud syukur atas nikmat Allah SWT dan kewajiban khalifah fil ardh.',
    },
    {
      q: `Tokoh cendekiawan muslim yang terkenal dengan ketekunan, kejujuran berpikir, dan karya besar yang menginspirasi dunia adalah...`,
      a: 'Al-Khawarizmi, Ibnu Sina, dan Al-Biruni',
      b: 'Hanya orang yang hidup di zaman modern',
      c: 'Mereka yang malas membaca buku',
      d: 'Orang yang tidak mau berbagi ilmu',
      correct: 'A',
      exp: 'Para cendekiawan muslim seperti Al-Khawarizmi dan Ibnu Sina menjadi teladan generasi madrasah berprestasi.',
    },
    {
      q: `Ketika kelompok menghadapi situasi hanya memiliki sisa 1 kesempatan (2 kesalahan) dalam game kreatif, strategi yang tepat adalah...`,
      a: 'Menjawab asal-asalan tanpa berhitung',
      b: 'Lebih tenang, teliti memeriksa opsi, dan bermusyawarah sebelum memencet tombol',
      c: 'Keluar dari ruangan arena',
      d: 'Menyerah sebelum waktu habis',
      correct: 'B',
      exp: 'Ketenangan dan kehati-hatian dalam berpikir kritis mencegah terjadinya kesalahan fatal ketiga.',
    }
  ];

  const templates = isIpasGrade6 ? ipas6Templates : genericTemplates;

  const results = [];
  for (let i = 0; i < count; i++) {
    const t = templates[i % templates.length];
    results.push({
      id: `smart-${Date.now()}-${i + 1}`,
      questionText: `${i + 1}. ${t.q}`,
      optionA: t.a,
      optionB: t.b,
      optionC: t.c,
      optionD: t.d,
      correctOption: t.correct,
      explanation: t.exp,
      points: difficulty === 'sulit_hots' ? 20 : (difficulty === 'sedang' ? 15 : 10),
      timeLimitSeconds: 30,
      subject,
      grade,
      difficulty,
      isAiGenerated: true,
    });
  }
  return results;
}

// Start Server with Vite Dev Server Middleware or Static Serve
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`  MIN 1 PASER - SISWA KREATIF DENGAN GAME KREATIF`);
    console.log(`  Kepala Madrasah : Ismail, S.Ag`);
    console.log(`  Pengembang      : Dzakirul Husni, S.Pd`);
    console.log(`  Server running on http://0.0.0.0:${PORT}`);
    console.log(`====================================================`);
  });
}

startServer();
