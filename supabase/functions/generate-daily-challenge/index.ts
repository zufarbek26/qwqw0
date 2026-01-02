import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Вопросы для каждого предмета
const questionBank: Record<string, Array<{
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}>> = {
  python: [
    { question: "Какой оператор используется для возведения в степень?", options: ["^", "**", "pow", "//"], correct_answer: 1, explanation: "В Python для возведения в степень используется оператор **" },
    { question: "Какой тип данных возвращает input()?", options: ["int", "float", "str", "any"], correct_answer: 2, explanation: "Функция input() всегда возвращает строку" },
    { question: "Что выведет print(type([]))?", options: ["<class 'list'>", "<class 'array'>", "<class 'tuple'>", "<class 'set'>"], correct_answer: 0, explanation: "[] создаёт пустой список" },
    { question: "Какой метод добавляет элемент в конец списка?", options: ["add()", "append()", "insert()", "extend()"], correct_answer: 1, explanation: "Метод append() добавляет один элемент в конец списка" },
    { question: "Как создать пустой словарь?", options: ["[]", "()", "{}", "dict[]"], correct_answer: 2, explanation: "{} создаёт пустой словарь" },
  ],
  javascript: [
    { question: "Чем отличается let от var?", options: ["Ничем", "Областью видимости", "Типом данных", "Скоростью"], correct_answer: 1, explanation: "let имеет блочную область видимости, var - функциональную" },
    { question: "Что вернёт typeof null?", options: ["'null'", "'object'", "'undefined'", "'number'"], correct_answer: 1, explanation: "Это известный баг в JavaScript" },
    { question: "Какой метод не изменяет исходный массив?", options: ["push()", "pop()", "map()", "splice()"], correct_answer: 2, explanation: "map() возвращает новый массив, не изменяя исходный" },
    { question: "Что такое замыкание?", options: ["Цикл", "Функция с доступом к внешним переменным", "Класс", "Объект"], correct_answer: 1, explanation: "Замыкание - функция, которая помнит своё лексическое окружение" },
    { question: "Как проверить массив ли переменная?", options: ["typeof arr", "arr instanceof Array", "arr.type()", "isArray(arr)"], correct_answer: 1, explanation: "Array.isArray() или instanceof Array - правильные способы" },
  ],
  html: [
    { question: "Какой тег используется для заголовка первого уровня?", options: ["<header>", "<h1>", "<heading>", "<title>"], correct_answer: 1, explanation: "<h1> - тег заголовка первого уровня" },
    { question: "Какой атрибут делает поле обязательным?", options: ["mandatory", "required", "necessary", "must"], correct_answer: 1, explanation: "Атрибут required делает поле обязательным" },
    { question: "Какой тег для создания ссылки?", options: ["<link>", "<href>", "<a>", "<url>"], correct_answer: 2, explanation: "Тег <a> создаёт гиперссылку" },
    { question: "Что означает DOCTYPE?", options: ["Тип документа", "Стиль", "Скрипт", "Ссылку"], correct_answer: 0, explanation: "DOCTYPE объявляет тип документа для браузера" },
    { question: "Какой тег для изображения?", options: ["<image>", "<img>", "<picture>", "<photo>"], correct_answer: 1, explanation: "<img> - основной тег для изображений" },
  ],
  css: [
    { question: "Какое свойство меняет цвет текста?", options: ["text-color", "font-color", "color", "foreground"], correct_answer: 2, explanation: "Свойство color устанавливает цвет текста" },
    { question: "Что такое flexbox?", options: ["Библиотека", "Модель разметки", "Анимация", "Фреймворк"], correct_answer: 1, explanation: "Flexbox - модель гибкой разметки" },
    { question: "Какая единица относительна к размеру шрифта?", options: ["px", "em", "vh", "%"], correct_answer: 1, explanation: "em относится к размеру шрифта родителя" },
    { question: "Как скрыть элемент полностью?", options: ["visibility: hidden", "display: none", "opacity: 0", "hidden: true"], correct_answer: 1, explanation: "display: none полностью убирает элемент из потока" },
    { question: "Что делает z-index?", options: ["Масштаб", "Порядок наложения", "Позицию", "Размер"], correct_answer: 1, explanation: "z-index управляет порядком наложения элементов" },
  ],
  math: [
    { question: "Чему равен log₁₀(100)?", options: ["1", "2", "10", "100"], correct_answer: 1, explanation: "10² = 100, поэтому log₁₀(100) = 2" },
    { question: "Производная x³ равна:", options: ["x²", "3x²", "3x", "x³"], correct_answer: 1, explanation: "По правилу: (xⁿ)' = n·xⁿ⁻¹" },
    { question: "Сумма углов треугольника:", options: ["90°", "180°", "270°", "360°"], correct_answer: 1, explanation: "Сумма углов любого треугольника равна 180°" },
    { question: "Чему равен sin(90°)?", options: ["0", "0.5", "1", "-1"], correct_answer: 2, explanation: "sin(90°) = 1" },
    { question: "Площадь круга:", options: ["πr", "2πr", "πr²", "2πr²"], correct_answer: 2, explanation: "S = πr² - формула площади круга" },
  ],
  physics: [
    { question: "Единица измерения силы:", options: ["Джоуль", "Ватт", "Ньютон", "Паскаль"], correct_answer: 2, explanation: "Сила измеряется в Ньютонах (Н)" },
    { question: "Скорость света примерно равна:", options: ["300 км/с", "3000 км/с", "300 000 км/с", "3 000 000 км/с"], correct_answer: 2, explanation: "c ≈ 300 000 км/с или 3×10⁸ м/с" },
    { question: "Закон Ома:", options: ["F=ma", "E=mc²", "I=U/R", "P=W/t"], correct_answer: 2, explanation: "Закон Ома: сила тока = напряжение / сопротивление" },
    { question: "Что такое инерция?", options: ["Скорость", "Свойство сохранять состояние", "Ускорение", "Сила"], correct_answer: 1, explanation: "Инерция - свойство тела сохранять скорость" },
    { question: "Единица мощности:", options: ["Джоуль", "Ватт", "Вольт", "Ампер"], correct_answer: 1, explanation: "Мощность измеряется в Ваттах (Вт)" },
  ],
  chemistry: [
    { question: "Химический символ золота:", options: ["Go", "Gd", "Au", "Ag"], correct_answer: 2, explanation: "Au от латинского Aurum" },
    { question: "pH нейтральной среды:", options: ["0", "7", "14", "1"], correct_answer: 1, explanation: "pH = 7 соответствует нейтральной среде" },
    { question: "Формула воды:", options: ["HO", "H₂O", "H₂O₂", "OH"], correct_answer: 1, explanation: "Вода состоит из 2 атомов водорода и 1 атома кислорода" },
    { question: "Что такое катализатор?", options: ["Реактив", "Ускоритель реакции", "Продукт", "Растворитель"], correct_answer: 1, explanation: "Катализатор ускоряет реакцию, не расходуясь" },
    { question: "Самый распространённый газ в атмосфере:", options: ["Кислород", "Азот", "Углекислый газ", "Аргон"], correct_answer: 1, explanation: "Азот составляет около 78% атмосферы" },
  ],
  biology: [
    { question: "Сколько хромосом у человека?", options: ["23", "46", "48", "44"], correct_answer: 1, explanation: "У человека 46 хромосом (23 пары)" },
    { question: "Что такое митохондрии?", options: ["Ядро клетки", "Энергетические станции", "Мембрана", "ДНК"], correct_answer: 1, explanation: "Митохондрии производят энергию (АТФ)" },
    { question: "Процесс фотосинтеза происходит в:", options: ["Ядре", "Митохондриях", "Хлоропластах", "Рибосомах"], correct_answer: 2, explanation: "Хлоропласты содержат хлорофилл для фотосинтеза" },
    { question: "ДНК расшифровывается как:", options: ["Дезоксирибонуклеиновая кислота", "Динуклеотидная кислота", "Диазотная кислота", "Дирибозная кислота"], correct_answer: 0, explanation: "ДНК - дезоксирибонуклеиновая кислота" },
    { question: "Красные кровяные тельца:", options: ["Лейкоциты", "Тромбоциты", "Эритроциты", "Плазма"], correct_answer: 2, explanation: "Эритроциты переносят кислород" },
  ],
  english: [
    { question: "Past tense of 'go':", options: ["goed", "went", "gone", "going"], correct_answer: 1, explanation: "Go - went - gone (неправильный глагол)" },
    { question: "Choose the correct: 'She ___ to school':", options: ["go", "goes", "going", "gone"], correct_answer: 1, explanation: "He/She/It + глагол с -s/-es" },
    { question: "What is the plural of 'child'?", options: ["childs", "childes", "children", "childrens"], correct_answer: 2, explanation: "Child - children (неправильное множественное)" },
    { question: "Which is a preposition?", options: ["beautiful", "quickly", "under", "run"], correct_answer: 2, explanation: "Under - предлог места" },
    { question: "'I have been waiting' is:", options: ["Present Simple", "Past Simple", "Present Perfect Continuous", "Future"], correct_answer: 2, explanation: "have/has been + V-ing = Present Perfect Continuous" },
  ],
  russian: [
    { question: "Сколько падежей в русском языке?", options: ["4", "5", "6", "7"], correct_answer: 2, explanation: "Именительный, родительный, дательный, винительный, творительный, предложный" },
    { question: "Какое слово пишется с Ь?", options: ["мяч", "ночь", "врач", "луч"], correct_answer: 1, explanation: "Ночь - существительное женского рода 3-го склонения" },
    { question: "Синоним слова 'большой':", options: ["маленький", "огромный", "низкий", "узкий"], correct_answer: 1, explanation: "Огромный = очень большой" },
    { question: "Сколько гласных букв в алфавите?", options: ["6", "10", "12", "33"], correct_answer: 1, explanation: "А, Е, Ё, И, О, У, Ы, Э, Ю, Я - 10 гласных" },
    { question: "Какая часть речи слово 'быстро'?", options: ["Прилагательное", "Наречие", "Глагол", "Существительное"], correct_answer: 1, explanation: "Быстро отвечает на вопрос 'как?' - наречие" },
  ],
};

const subjects = ['python', 'javascript', 'html', 'css', 'math', 'physics', 'chemistry', 'biology', 'english', 'russian'];

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Проверяем, есть ли уже задание на сегодня
    const today = new Date().toISOString().split('T')[0];
    
    const { data: existingChallenge } = await supabase
      .from('daily_challenges')
      .select('id')
      .eq('challenge_date', today)
      .single();

    if (existingChallenge) {
      console.log('Challenge for today already exists');
      return new Response(
        JSON.stringify({ message: 'Challenge already exists for today', id: existingChallenge.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Выбираем случайный предмет
    const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
    const questions = questionBank[randomSubject];
    
    // Выбираем случайный вопрос
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];

    // Создаём новое ежедневное задание
    const { data: newChallenge, error } = await supabase
      .from('daily_challenges')
      .insert({
        subject: randomSubject,
        challenge_date: today,
        points_reward: 15,
        question: {
          question: randomQuestion.question,
          options: randomQuestion.options,
          correct_answer: randomQuestion.correct_answer,
          explanation: randomQuestion.explanation,
        },
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating challenge:', error);
      throw error;
    }

    console.log('Created daily challenge:', newChallenge);

    return new Response(
      JSON.stringify({ success: true, challenge: newChallenge }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
