import React, { useState } from 'react';
import './App.css';

export default function App() {
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('female');
  const [calories, setCalories] = useState('');
  const [currentFiber, setCurrentFiber] = useState('');
  const [fruitVeg, setFruitVeg] = useState('some');
  const [wholeGrains, setWholeGrains] = useState('some');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const inputBase =
    'w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm';

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    const ageNum = Number(age);
    const calNum = calories ? Number(calories) : null;
    const fiberNum = Number(currentFiber);

    if (!ageNum || ageNum < 16) {
      setError('Please enter a valid age (16+).');
      return;
    }

    if (calNum !== null && (calNum <= 600 || Number.isNaN(calNum))) {
      setError(
        'If you enter calories, please use a realistic daily estimate (e.g. 1400–3500 kcal).'
      );
      return;
    }

    if (!fiberNum || fiberNum <= 0) {
      setError('Please enter your current daily fiber intake in grams.');
      return;
    }

    const analysis = buildFiberAnalysis({
      age: ageNum,
      sex,
      calories: calNum,
      currentFiber: fiberNum,
      fruitVeg,
      wholeGrains,
    });

    setResult(analysis);
  };

  const buildFiberAnalysis = ({
    age,
    sex,
    calories,
    currentFiber,
    fruitVeg,
    wholeGrains,
  }) => {
    // 1. Baseline target using simple adult guidelines
    // Very rough: ~25 g women, ~38 g men under 50; slightly lower 50+
    let baselineTarget;

    if (sex === 'male') {
      baselineTarget = age < 50 ? 38 : 30;
    } else if (sex === 'female') {
      baselineTarget = age < 50 ? 25 : 21;
    } else {
      baselineTarget = age < 50 ? 30 : 25;
    }

    // 2. Calorie-based adjustment: ~14 g per 1000 kcal (if calories known)
    let calBasedTarget = null;
    if (calories && calories > 0) {
      calBasedTarget = (calories / 1000) * 14;
    }

    // 3. Combine targets (average of the two if both exist)
    let suggestedTarget;
    if (calBasedTarget) {
      suggestedTarget = (baselineTarget + calBasedTarget) / 2;
    } else {
      suggestedTarget = baselineTarget;
    }

    // Keep in a reasonable band
    suggestedTarget = Math.max(18, Math.min(suggestedTarget, 45));
    suggestedTarget = Math.round(suggestedTarget);

    const ratio = currentFiber / suggestedTarget;
    const zone = classifyZone(ratio);
    const interpretation = interpretZone(zone, currentFiber, suggestedTarget);
    const tips = buildTips(zone, fruitVeg, wholeGrains);

    return {
      input: {
        age,
        sex,
        calories,
        currentFiber,
        fruitVeg,
        wholeGrains,
      },
      target: {
        suggestedTarget,
        baselineTarget: Math.round(baselineTarget),
        calBasedTarget: calBasedTarget ? Math.round(calBasedTarget) : null,
        ratio: Number(ratio.toFixed(2)),
      },
      zone,
      interpretation,
      tips,
    };
  };

  const classifyZone = (ratio) => {
    if (ratio < 0.6) {
      return { level: 'low', label: 'Well Below Suggested Range' };
    }
    if (ratio >= 0.6 && ratio < 0.8) {
      return { level: 'slightlyLow', label: 'Slightly Below Range' };
    }
    if (ratio >= 0.8 && ratio <= 1.2) {
      return { level: 'within', label: 'Within Suggested Range' };
    }
    if (ratio > 1.2 && ratio <= 1.6) {
      return { level: 'above', label: 'Above Suggested Range' };
    }
    return { level: 'wellAbove', label: 'Well Above Suggested Range' };
  };

  const interpretZone = (zone, currentFiber, target) => {
    switch (zone.level) {
      case 'low':
        return (
          'Your estimated intake is well below this simple fiber target. ' +
          'Many people feel better digestive-wise and hunger-wise when they gradually work closer to the suggested range.'
        );
      case 'slightlyLow':
        return (
          'You’re not far below the suggested band. A few small tweaks—like one extra fruit/veg serving or swapping in a higher-fiber grain—' +
          'may be enough to bring you into range.'
        );
      case 'within':
        return (
          'Your current intake sits inside the suggested band. That doesn’t mean it’s perfect, ' +
          'but it’s roughly consistent with common fiber guidelines for many adults.'
        );
      case 'above':
        return (
          'You’re somewhat above this suggested range. If you feel good (no major bloating or discomfort) and drink enough fluids, ' +
          'this may be fine for you.'
        );
      case 'wellAbove':
        return (
          'You’re well above this rough band. Some people prefer very high fiber, but for others it can cause bloating or discomfort—' +
          'especially if fluids are low or increases were sudden.'
        );
      default:
        return '';
    }
  };

  const buildTips = (zone, fruitVeg, wholeGrains) => {
    const general = [
      'Increase fiber gradually over days and weeks rather than all at once.',
      'Drink enough fluids, especially water, as fiber needs fluid to move comfortably through the gut.',
      'If you have digestive conditions (e.g., IBS, IBD), follow advice from your healthcare team before making big changes.',
    ];

    const tips = [];

    if (fruitVeg === 'little') {
      tips.push(
        'Start by adding 1 extra serving of fruit or vegetables per day (e.g., a piece of fruit or a handful of veggies at a meal).'
      );
    } else if (fruitVeg === 'some') {
      tips.push(
        'You already have some fruit/veg most days; consider turning one snack or side into a more fiber-rich choice (e.g., berries instead of a low-fiber dessert).'
      );
    } else {
      tips.push(
        'You report plenty of fruit/veg—nice. Focus on variety (different colors and types) to get a broader mix of fibers.'
      );
    }

    if (wholeGrains === 'little') {
      tips.push(
        'Try swapping one refined grain for a whole-grain version (e.g., brown rice, oats, whole-grain bread, or whole-wheat pasta).'
      );
    } else if (wholeGrains === 'some') {
      tips.push(
        'You already include some whole grains; consider one more portion on days that are lower in fiber.'
      );
    } else {
      tips.push(
        'You’re already getting several whole-grain servings. If fiber is still low, consider beans, lentils, nuts, or seeds as add-ons.'
      );
    }

    if (zone.level === 'low' || zone.level === 'slightlyLow') {
      tips.push(
        'Legumes (beans, lentils, chickpeas) are powerful fiber boosters—start with small portions if you’re not used to them.'
      );
    }

    if (zone.level === 'wellAbove') {
      tips.push(
        'If you notice discomfort, you could slightly reduce very high-fiber extras (e.g., bran, multiple fiber supplements) and see if symptoms improve.'
      );
    }

    return [...tips, ...general];
  };

  const badgeClass = (level) => {
    switch (level) {
      case 'low':
        return 'bg-red-100 text-red-700';
      case 'slightlyLow':
        return 'bg-orange-100 text-orange-700';
      case 'within':
        return 'bg-emerald-100 text-emerald-700';
      case 'above':
        return 'bg-sky-100 text-sky-700';
      case 'wellAbove':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className='min-h-screen bg-gray-100 flex justify-center py-10 px-4'>
      <div className='w-full max-w-md h-fit bg-white shadow-md rounded-xl p-6'>
        <h2 className='text-2xl font-semibold text-center mb-2'>
          Fiber Intake Monitor
        </h2>
        <p className='text-gray-500 text-sm text-center mb-5'>
          Compare your estimated daily fiber intake to a simple guideline-based
          target. Educational only and{' '}
          <span className='font-semibold'>not</span> medical or dietetic advice.
        </p>

        {/* FORM */}
        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* Age + Sex */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-1'>
              <label className='text-sm font-medium block'>Age (years)</label>
              <input
                className={inputBase}
                type='number'
                placeholder='e.g. 30'
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
              />
            </div>
            <div className='space-y-1'>
              <label className='text-sm font-medium block'>Sex</label>
              <select
                className={inputBase}
                value={sex}
                onChange={(e) => setSex(e.target.value)}
              >
                <option value='female'>Female</option>
                <option value='male'>Male</option>
                <option value='other'>Other / Prefer not to say</option>
              </select>
            </div>
          </div>

          {/* Calories (optional) */}
          <div className='space-y-1'>
            <label className='text-sm font-medium block'>
              Typical daily calories (optional)
            </label>
            <input
              className={inputBase}
              type='number'
              placeholder='e.g. 2000'
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
            />
            <p className='text-[11px] text-gray-400'>
              If you track calories, enter your usual daily amount to refine the
              suggested fiber target. You can leave this blank.
            </p>
          </div>

          {/* Current fiber */}
          <div className='space-y-1'>
            <label className='text-sm font-medium block'>
              Current average fiber intake (per day)
            </label>
            <input
              className={inputBase}
              type='number'
              placeholder='e.g. 18'
              value={currentFiber}
              onChange={(e) => setCurrentFiber(e.target.value)}
              required
            />
            <p className='text-[11px] text-gray-400'>
              Estimate in grams per day from a typical week (apps or labels can
              help).
            </p>
          </div>

          {/* Fruit & veg frequency */}
          <div className='space-y-1'>
            <label className='text-sm font-medium block'>
              Fruit & vegetable servings on a typical day
            </label>
            <select
              className={inputBase}
              value={fruitVeg}
              onChange={(e) => setFruitVeg(e.target.value)}
            >
              <option value='little'>0–1 servings most days</option>
              <option value='some'>2–3 servings most days</option>
              <option value='plenty'>4+ servings most days</option>
            </select>
          </div>

          {/* Whole grains */}
          <div className='space-y-1'>
            <label className='text-sm font-medium block'>
              Whole grain choices on a typical day
            </label>
            <select
              className={inputBase}
              value={wholeGrains}
              onChange={(e) => setWholeGrains(e.target.value)}
            >
              <option value='little'>
                Mostly white/refined grains (bread, rice, pasta)
              </option>
              <option value='some'>
                Mix of whole grains and refined grains
              </option>
              <option value='plenty'>
                Mostly whole grains (e.g. oats, brown rice, whole-wheat bread)
              </option>
            </select>
          </div>

          <button
            type='submit'
            className='w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg text-sm transition'
          >
            Check Fiber Intake
          </button>
        </form>

        {/* ERROR */}
        {error && (
          <p className='mt-4 bg-red-100 text-red-600 p-3 rounded-lg text-sm'>
            {error}
          </p>
        )}

        {/* RESULT */}
        {result && (
          <div className='bg-gray-50 p-4 rounded-lg shadow-inner mt-6'>
            <div className='flex items-center justify-between mb-2'>
              <h3 className='text-lg font-medium'>Your Fiber Snapshot</h3>
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${badgeClass(
                  result.zone.level
                )}`}
              >
                {result.zone.label}
              </span>
            </div>

            {/* Numbers summary */}
            <div className='text-xs text-gray-500 mb-3 space-y-1'>
              <p>
                Current intake:{' '}
                <span className='font-semibold'>
                  {result.input.currentFiber} g/day
                </span>
              </p>
              <p>
                Suggested target:{' '}
                <span className='font-semibold'>
                  {result.target.suggestedTarget} g/day
                </span>
              </p>
              <p>
                Ratio to target:{' '}
                <span className='font-semibold'>
                  {Math.round(result.target.ratio * 100)}%
                </span>
              </p>
              <p>
                Baseline guideline (age/sex):{' '}
                <span className='font-semibold'>
                  {result.target.baselineTarget} g/day
                </span>
                {result.target.calBasedTarget && (
                  <>
                    {' '}
                    | Calorie-based (~14 g/1000 kcal):{' '}
                    <span className='font-semibold'>
                      {result.target.calBasedTarget} g/day
                    </span>
                  </>
                )}
              </p>
            </div>

            <p className='text-sm text-gray-700 mb-2'>
              {result.interpretation}
            </p>

            {result.tips?.length > 0 && (
              <>
                <h4 className='text-sm font-semibold mb-1'>
                  Practical habit ideas:
                </h4>
                <ul className='list-disc list-inside text-sm text-gray-700 space-y-1'>
                  {result.tips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </>
            )}

            <hr className='my-3' />

            <p className='text-[11px] text-gray-400'>
              This monitor uses simple public guidelines and can’t account for
              individual medical needs. If you have digestive conditions or are
              unsure how much fiber is right for you, follow advice from your
              healthcare professional or registered dietitian.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
