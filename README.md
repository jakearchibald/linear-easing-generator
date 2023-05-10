# [linear() easing generator](https://linear-easing-generator.netlify.app/)

For a long time, easing on the web was limited to `cubic-bezier`, meaning you couldn't do easings like bounce, spring, or elastic without JavaScript. But now `linear()` is here! Well, [almost here](https://caniuse.com/mdn-css_types_easing-function_linear-function).

`linear()` works by defining a set of points. And, if you define enough points, you can create things that look and feel like curves.

That's where the [linear() easing generator](https://linear-easing-generator.netlify.app/) comes in. It can convert JavaScript/SVG easing definitions into `linear()` format.

[Check out the bounce demo](https://linear-easing-generator.netlify.app/?codeType=js&code=self.bounce+%3D+function%28pos%29+%7B%0A++const+n1+%3D+7.5625%3B%0A++const+d1+%3D+2.75%3B%0A%0A++if+%28pos+<+1+%2F+d1%29+%7B%0A++++return+n1+*+pos+*+pos%3B%0A++%7D+else+if+%28pos+<+2+%2F+d1%29+%7B%0A++++return+n1+*+%28pos+-%3D+1.5+%2F+d1%29+*+pos+%2B+0.75%3B%0A++%7D+else+if+%28pos+<+2.5+%2F+d1%29+%7B%0A++++return+n1+*+%28pos+-%3D+2.25+%2F+d1%29+*+pos+%2B+0.9375%3B%0A++%7D+else+%7B%0A++++return+n1+*+%28pos+-%3D+2.625+%2F+d1%29+*+pos+%2B+0.984375%3B%0A++%7D%0A%7D&simplify=0.0017&round=3). It gives you:

```css
:root {
  --bounce-easing: linear(
    0, 0.004, 0.016, 0.035, 0.063, 0.098, 0.141 13.6%, 0.25, 0.391, 0.563, 0.765,
    1, 0.891 40.9%, 0.848, 0.813, 0.785, 0.766, 0.754, 0.75, 0.754, 0.766, 0.785,
    0.813, 0.848, 0.891 68.2%, 1 72.7%, 0.973, 0.953, 0.941, 0.938, 0.941, 0.953,
    0.973, 1, 0.988, 0.984, 0.988, 1
  );
}
```

Which you can use in animations and transitions:

```css
.whatever {
  animation-timing-function: var(--bounce-easing);
}
```

## Running locally

```
npm i
npm run dev
```
