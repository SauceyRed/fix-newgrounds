# FixNewgrounds

### About
Ever wanted to have embeds show up when you send a Newgrounds post?  
Just add "fix" before "newgrounds" and watch the magic happen!

Original:  
`https://www.newgrounds.com/art/view/4wk/gift-for-a-friend`  
Fixed:  
`https://www.fixnewgrounds.com/art/view/4wk/gift-for-a-friend`

### Install and Run
To run this project, first clone the repo.  
Once you've done that, ensure you have pnpm installed:
```bash
npm i -g pnpm
```
Then run the following commands inside the project's directory:
```bash
pnpm i
pnpm start
```
Next, you'll wanna have an HTTP client installed, such as [Postman](https://www.postman.com/),
[Insomnnia](https://insomnia.rest/), etc.  
Alternatively you could just use `curl`.

Now you can simply try to send a GET request to a fixed Newgrounds URL
to see the response.
```
GET http://localhost:7854/art/view/4wk/gift-for-a-friend
```
If everything is right, the response should look a
little something like this:
```html
<!DOCTYPE html>

<head>
    <link rel="canonical" href="https://www.newgrounds.com/art/view/4wk/gift-for-a-friend" />
    <meta property="og:title" content="gift for a friend" />
    <meta property="og:description" content="👀 1,691 🌟 248 🖐️ 587 ⭐ 4.77 / 5.00

May 25, 2025 12:58 AM EDT" />
    <meta property="og:url" content="https://www.newgrounds.com/art/view/4wk/gift-for-a-friend" />
    <meta property="og:image"
        content="https://art.ngfiles.com/images/6721000/6721455_2043851_4wk_untitled-6721455.36f2d145774168f1b5145640c4379f32.webp?f1748149209" />
    <meta property="og:site_name" content="FixNewgrounds" />
    <meta property="twitter:title" content="gift for a friend" />
    <meta property="twitter:site" content="4WK" />
    <meta property="twitter:creator" content="4WK" />
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="theme-color" content="#fda238" />
    <link rel="alternate" href="http://localhost:7854/oembed?title=4wk&url=https%3A%2F%2F4WK.newgrounds.com%2F"
        type="application/json+oembed" title="4WK">
</head>

<body></body>

</html>
```
If you try to send a request to that `alternate` URL, you should get something like this:
```json
{
    "author_name": "4wk",
    "author_url": "https://4WK.newgrounds.com/"
}
```
That's it!  
If you have any more questions, feel free to reach out
or make an [Issue](https://github.com/SauceyRed/fix-newgrounds/issues/new/choose).

### Contributions
Contributions are welcome. If you'd like to contribute, just fork the repo, make your changes,
and create a pull request. I'll review it when I have time.  
If you come across any bugs or other problems, feel free to create
an [Issue](https://github.com/SauceyRed/fix-newgrounds/issues/new/choose).

### Contact
If you need help with something, have a question, or want to let me know if something's wrong,
feel free to reach out to me on [email](mailto:contact@fixnewgrounds.com),
[Twitter](https://twitter.com/SauceyRedHN), or [BlueSky](https://bsky.app/profile/saucey.red).


#### Privacy Disclaimer
This site does not store any data.  
The only data measured is what Cloudflare's free tier has by default, which is traffic data
that includes only how many requests have been sent and from which countries.
