/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.2.0/workbox-sw.js");

importScripts(
  "dist/precache-manifest.adf917db09d1aef0c84e6e57cbdee8dc.js"
);

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

workbox.core.clientsClaim();

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [
  {
    "url": "public/archie.png",
    "revision": "1a24d517ea25914f617b79933b045f6f"
  },
  {
    "url": "public/freedoom1.json",
    "revision": "36cc6975d4e1c1a12b59dd7b4eeac0e6"
  },
  {
    "url": "public/freedoom1.wad",
    "revision": "ea471a3d38fcee0fb3a69bcd3221e335"
  },
  {
    "url": "public/freedoom2.wad",
    "revision": "984f99af08f085e38070f51095ab7c31"
  },
  {
    "url": "public/midi/libtimidity.js",
    "revision": "87ff8b9139fc419697ed9a90e61196e5"
  },
  {
    "url": "public/midi/pat/arachno-0.pat",
    "revision": "5c1209700df75fe72fbaa7c7bd9bcad7"
  },
  {
    "url": "public/midi/pat/arachno-1.pat",
    "revision": "d15b798d4a346788f845b2a42aece411"
  },
  {
    "url": "public/midi/pat/arachno-10.pat",
    "revision": "211e7158b896e1666741c3ec74f62e49"
  },
  {
    "url": "public/midi/pat/arachno-100.pat",
    "revision": "4302f959f94a67db32868b2b716630c3"
  },
  {
    "url": "public/midi/pat/arachno-101.pat",
    "revision": "7581a55292fd4cc1dcf5006ef24cd4b7"
  },
  {
    "url": "public/midi/pat/arachno-102.pat",
    "revision": "3684e9ba46e7058f3af48acc963a18d1"
  },
  {
    "url": "public/midi/pat/arachno-103.pat",
    "revision": "3bb93120402b34eb8804406e01391f8f"
  },
  {
    "url": "public/midi/pat/arachno-104.pat",
    "revision": "4f1b78324a2daaf193cffe27d7a36a99"
  },
  {
    "url": "public/midi/pat/arachno-105.pat",
    "revision": "bf146975e7103b3241faae9773e59f07"
  },
  {
    "url": "public/midi/pat/arachno-106.pat",
    "revision": "0c9a7a0714fdb58e287e2e06193fbe15"
  },
  {
    "url": "public/midi/pat/arachno-107.pat",
    "revision": "f57c32a99b19497cb043eb830b820679"
  },
  {
    "url": "public/midi/pat/arachno-108.pat",
    "revision": "eb91a16187240b0b55b2c2a8bd90f02c"
  },
  {
    "url": "public/midi/pat/arachno-109.pat",
    "revision": "c0504efb1ef06f88e5a04e57f0f0bc7e"
  },
  {
    "url": "public/midi/pat/arachno-11.pat",
    "revision": "99a8bd8cebfb8bc4388ace092b9b98d2"
  },
  {
    "url": "public/midi/pat/arachno-110.pat",
    "revision": "f3a277281872dda2c0247af147f1e1f8"
  },
  {
    "url": "public/midi/pat/arachno-111.pat",
    "revision": "eb690a1d7fc5ff7cc279b8c4d6f36ce6"
  },
  {
    "url": "public/midi/pat/arachno-112.pat",
    "revision": "8bd62535d3fe366d4ab11cf87774ac53"
  },
  {
    "url": "public/midi/pat/arachno-113.pat",
    "revision": "12ed335f8861cc368f5b03fd3a36e233"
  },
  {
    "url": "public/midi/pat/arachno-114.pat",
    "revision": "bb780f443527640dc729b1ff53e94e93"
  },
  {
    "url": "public/midi/pat/arachno-115.pat",
    "revision": "b84dab27d61295c4df2d62f7bba32782"
  },
  {
    "url": "public/midi/pat/arachno-116.pat",
    "revision": "f93e8d63a1e1b1cf97330073525b8692"
  },
  {
    "url": "public/midi/pat/arachno-117.pat",
    "revision": "28722f4169cd7332838e5532eec90632"
  },
  {
    "url": "public/midi/pat/arachno-118.pat",
    "revision": "59f414afccc34fbab37af6a7bc49db9b"
  },
  {
    "url": "public/midi/pat/arachno-119.pat",
    "revision": "470785a928debba31fd6b098392007ee"
  },
  {
    "url": "public/midi/pat/arachno-12.pat",
    "revision": "e4bf92393546ec766353e3a819f04ae1"
  },
  {
    "url": "public/midi/pat/arachno-120.pat",
    "revision": "e4b21e04f1dc8d3c118bd63680a030fc"
  },
  {
    "url": "public/midi/pat/arachno-121.pat",
    "revision": "0250f52234d0e2ade94fcf3608e67ecf"
  },
  {
    "url": "public/midi/pat/arachno-122.pat",
    "revision": "3e459abce113b280222b535f3033e685"
  },
  {
    "url": "public/midi/pat/arachno-123.pat",
    "revision": "d42355135bd36bb86614110cbc1bb4d0"
  },
  {
    "url": "public/midi/pat/arachno-124.pat",
    "revision": "388603d794c3d6b407059531750b0c72"
  },
  {
    "url": "public/midi/pat/arachno-125.pat",
    "revision": "b762a6241b72c289901a43fc7d659ed3"
  },
  {
    "url": "public/midi/pat/arachno-126.pat",
    "revision": "34cda7ae374bb42f49019afb9d6d9c1b"
  },
  {
    "url": "public/midi/pat/arachno-127.pat",
    "revision": "084b444aca643ab56db552f1ec8ed5c3"
  },
  {
    "url": "public/midi/pat/arachno-13.pat",
    "revision": "9622f280b55c4cafe2364fe6c745e980"
  },
  {
    "url": "public/midi/pat/arachno-14.pat",
    "revision": "19c2b62a2763e1ddb0cf662e9be341a9"
  },
  {
    "url": "public/midi/pat/arachno-15.pat",
    "revision": "89e026198206170f2f1cbc98d3f52eb4"
  },
  {
    "url": "public/midi/pat/arachno-16.pat",
    "revision": "a746a365e92b9b1d2eb7a6ca65a0cef1"
  },
  {
    "url": "public/midi/pat/arachno-17.pat",
    "revision": "23209a034c6975380d74da1a9eda4715"
  },
  {
    "url": "public/midi/pat/arachno-18.pat",
    "revision": "073318db4f1401bb83c622c7cb1449d8"
  },
  {
    "url": "public/midi/pat/arachno-19.pat",
    "revision": "52d353d4eeb6e24fc4d44f1431684c18"
  },
  {
    "url": "public/midi/pat/arachno-2.pat",
    "revision": "89a9619c0541e1509343544f9d7c35e6"
  },
  {
    "url": "public/midi/pat/arachno-20.pat",
    "revision": "1ca7cf3c803626919a5e08bdf64424b1"
  },
  {
    "url": "public/midi/pat/arachno-21.pat",
    "revision": "638767fef0c39b032943de42ea287adc"
  },
  {
    "url": "public/midi/pat/arachno-22.pat",
    "revision": "1055cbaa575e3275a6f032900486341b"
  },
  {
    "url": "public/midi/pat/arachno-23.pat",
    "revision": "22bb03015d72edda40fea2663280ed82"
  },
  {
    "url": "public/midi/pat/arachno-24.pat",
    "revision": "e9e2214a4e62f0d10113190d6d403d86"
  },
  {
    "url": "public/midi/pat/arachno-25.pat",
    "revision": "644f28072e3311de43cfb46157d6cc5e"
  },
  {
    "url": "public/midi/pat/arachno-26.pat",
    "revision": "ec1548198bb97a34acfd4d07185c29eb"
  },
  {
    "url": "public/midi/pat/arachno-27.pat",
    "revision": "d0b93fee4aed4abe577f098e17a6310f"
  },
  {
    "url": "public/midi/pat/arachno-28.pat",
    "revision": "33106c4c3986cf42dcd6e7d0acdf2731"
  },
  {
    "url": "public/midi/pat/arachno-29.pat",
    "revision": "70be0e50fb2fee08217e6d80c3dd24b2"
  },
  {
    "url": "public/midi/pat/arachno-3.pat",
    "revision": "2a453ce1cb6a7ff893c411ce43fcc362"
  },
  {
    "url": "public/midi/pat/arachno-30.pat",
    "revision": "d4fd17978e9d08e2c140fbbeb6501eb8"
  },
  {
    "url": "public/midi/pat/arachno-31.pat",
    "revision": "c2bbc5de160d437b14391288c45d9fe5"
  },
  {
    "url": "public/midi/pat/arachno-32.pat",
    "revision": "071469e829b943ac816b8e4666a58850"
  },
  {
    "url": "public/midi/pat/arachno-33.pat",
    "revision": "de095e88d3c45b5d580d113c753b3a17"
  },
  {
    "url": "public/midi/pat/arachno-34.pat",
    "revision": "353e69548ee4481195f108c24ac0303d"
  },
  {
    "url": "public/midi/pat/arachno-35.pat",
    "revision": "f552166d7fec7ba9e47c452731d9cb4a"
  },
  {
    "url": "public/midi/pat/arachno-36.pat",
    "revision": "36b9c2467f30dfe9b40b36aef6507b40"
  },
  {
    "url": "public/midi/pat/arachno-37.pat",
    "revision": "4d945b127dca075564ffd9f3d22ad928"
  },
  {
    "url": "public/midi/pat/arachno-38.pat",
    "revision": "e42f79c45b57bc28623514b3c251ed24"
  },
  {
    "url": "public/midi/pat/arachno-39.pat",
    "revision": "5f85144097da9ca2549cd8544a958c5b"
  },
  {
    "url": "public/midi/pat/arachno-4.pat",
    "revision": "12901c59b5d4e62c80616ea6f7f8369c"
  },
  {
    "url": "public/midi/pat/arachno-40.pat",
    "revision": "3dbafe755d0e25e1e807e909ff5ba34b"
  },
  {
    "url": "public/midi/pat/arachno-41.pat",
    "revision": "18272e470a41b39a4ed5d7ea015652ed"
  },
  {
    "url": "public/midi/pat/arachno-42.pat",
    "revision": "0282bdf02e9343a0f5029532c461e6c3"
  },
  {
    "url": "public/midi/pat/arachno-43.pat",
    "revision": "ce0cf82819015a2f5f1ea294511253a5"
  },
  {
    "url": "public/midi/pat/arachno-44.pat",
    "revision": "32a32313329391de8c08ad689f5cd79e"
  },
  {
    "url": "public/midi/pat/arachno-45.pat",
    "revision": "08b2cd572696a3682d9a92263f6b8719"
  },
  {
    "url": "public/midi/pat/arachno-46.pat",
    "revision": "5dac05b745359d130e18269cbab33f5f"
  },
  {
    "url": "public/midi/pat/arachno-47.pat",
    "revision": "bd1cf376b043679f84ff3d78638625e7"
  },
  {
    "url": "public/midi/pat/arachno-48.pat",
    "revision": "65af6e17fe42200ef5d31e394d0fc67c"
  },
  {
    "url": "public/midi/pat/arachno-49.pat",
    "revision": "5297988879cc2a4a105998216b80548b"
  },
  {
    "url": "public/midi/pat/arachno-5.pat",
    "revision": "7582e839a4a2ea60dfcd4c1fe5d733f7"
  },
  {
    "url": "public/midi/pat/arachno-50.pat",
    "revision": "15754e345a34d8d23190e9c5d0e38317"
  },
  {
    "url": "public/midi/pat/arachno-51.pat",
    "revision": "f512063f45bc4d9535049f58f19ef5d0"
  },
  {
    "url": "public/midi/pat/arachno-52.pat",
    "revision": "7ee8571a9c27b67fe167f5ccd34d08b8"
  },
  {
    "url": "public/midi/pat/arachno-53.pat",
    "revision": "74116da931acaed3185fd06ebc9e86a8"
  },
  {
    "url": "public/midi/pat/arachno-54.pat",
    "revision": "9fecb43f91e99f9103a2d6a949e362b9"
  },
  {
    "url": "public/midi/pat/arachno-55.pat",
    "revision": "383eb9a5f061c879832f359fbb9b2494"
  },
  {
    "url": "public/midi/pat/arachno-56.pat",
    "revision": "d54ce30ded31bb88cd0b657c991cde32"
  },
  {
    "url": "public/midi/pat/arachno-57.pat",
    "revision": "f8a97d7ef614e367f116be20010b54fd"
  },
  {
    "url": "public/midi/pat/arachno-58.pat",
    "revision": "e2024f3a286b3f624cd900bd36b9ca46"
  },
  {
    "url": "public/midi/pat/arachno-59.pat",
    "revision": "00bdb024b59832aa2ddb4c0f99cb1233"
  },
  {
    "url": "public/midi/pat/arachno-6.pat",
    "revision": "1e396ed3fa89c39daf3b1951f4cf98bd"
  },
  {
    "url": "public/midi/pat/arachno-60.pat",
    "revision": "def8d084a48155406583385ccd3a967e"
  },
  {
    "url": "public/midi/pat/arachno-61.pat",
    "revision": "85f6914bd2c7fb1ac00975b2b515e82c"
  },
  {
    "url": "public/midi/pat/arachno-62.pat",
    "revision": "f84ad444dfc355f5ada8dd2f7241710c"
  },
  {
    "url": "public/midi/pat/arachno-63.pat",
    "revision": "a163a1c4685df9c47fef7bbabda91900"
  },
  {
    "url": "public/midi/pat/arachno-64.pat",
    "revision": "81538e5e61e42f5a67b96a6541d4a234"
  },
  {
    "url": "public/midi/pat/arachno-65.pat",
    "revision": "d7f12746e7b15832e9b0ff28cbaf4dfc"
  },
  {
    "url": "public/midi/pat/arachno-66.pat",
    "revision": "16257d5ea6b83f53f0fab86ca6fe4b0a"
  },
  {
    "url": "public/midi/pat/arachno-67.pat",
    "revision": "41c3a23bc7dedf308799ef4d2023f2e1"
  },
  {
    "url": "public/midi/pat/arachno-68.pat",
    "revision": "b51275ae799ba05d2ddf5bd7efa1267d"
  },
  {
    "url": "public/midi/pat/arachno-69.pat",
    "revision": "eb637732045cfbdbab8e645340da0d3a"
  },
  {
    "url": "public/midi/pat/arachno-7.pat",
    "revision": "5e3c33c7b20a166c4a078f0f6b1568e2"
  },
  {
    "url": "public/midi/pat/arachno-70.pat",
    "revision": "b496fa4d25a4c5ded8aa0164018227ae"
  },
  {
    "url": "public/midi/pat/arachno-71.pat",
    "revision": "f311016e787ccd09f2a873a8c4032a71"
  },
  {
    "url": "public/midi/pat/arachno-72.pat",
    "revision": "b882c72895a6d239d74ee37eeb34a4b5"
  },
  {
    "url": "public/midi/pat/arachno-73.pat",
    "revision": "e6f9bdd8bbd6fffabc45105bdc6cb4a0"
  },
  {
    "url": "public/midi/pat/arachno-74.pat",
    "revision": "01ba7ba2ec9f9ddb26893465b5aedede"
  },
  {
    "url": "public/midi/pat/arachno-75.pat",
    "revision": "bea36d6c8500ce0f4d698f1005c9be9f"
  },
  {
    "url": "public/midi/pat/arachno-76.pat",
    "revision": "a903d1767473f72e095288ea6ee3882f"
  },
  {
    "url": "public/midi/pat/arachno-77.pat",
    "revision": "5c0e387179cc5eb8050566761a5b808e"
  },
  {
    "url": "public/midi/pat/arachno-78.pat",
    "revision": "d9d24f84b1f02100203a0be6457a9817"
  },
  {
    "url": "public/midi/pat/arachno-79.pat",
    "revision": "994c7fab42aa2b14f5022c5648457d7b"
  },
  {
    "url": "public/midi/pat/arachno-8.pat",
    "revision": "494faec4512a5d5e21391ec98aed8742"
  },
  {
    "url": "public/midi/pat/arachno-80.pat",
    "revision": "0f3cb2ff764ca1803cb110ed4ba37120"
  },
  {
    "url": "public/midi/pat/arachno-81.pat",
    "revision": "9c8bbbb6cc201b8f4cf6b33d02d00aec"
  },
  {
    "url": "public/midi/pat/arachno-82.pat",
    "revision": "b957c5bb7bd04b7f34ba3880b326b5f8"
  },
  {
    "url": "public/midi/pat/arachno-83.pat",
    "revision": "74ad3e0582a75144b1769a04845c1e70"
  },
  {
    "url": "public/midi/pat/arachno-84.pat",
    "revision": "a5a48b981e640025acff247cf663bdd3"
  },
  {
    "url": "public/midi/pat/arachno-85.pat",
    "revision": "fb4037d91fa40d801f5ba6d63293ce52"
  },
  {
    "url": "public/midi/pat/arachno-86.pat",
    "revision": "e8c1c33daaa49f260134d555baa37586"
  },
  {
    "url": "public/midi/pat/arachno-87.pat",
    "revision": "d660f0b8af2c8be9228c1264225af6c3"
  },
  {
    "url": "public/midi/pat/arachno-88.pat",
    "revision": "9981cff94d32a1a579d0a2fae63a194f"
  },
  {
    "url": "public/midi/pat/arachno-89.pat",
    "revision": "a76fb9e17a72c44f43a78d0556aa5ab8"
  },
  {
    "url": "public/midi/pat/arachno-9.pat",
    "revision": "5fdeb0d7436dfcb21a4acf031e5c259e"
  },
  {
    "url": "public/midi/pat/arachno-90.pat",
    "revision": "9a966f7e426c65186d9401ffd4384053"
  },
  {
    "url": "public/midi/pat/arachno-91.pat",
    "revision": "7f58bbbe375a490d90d522f8590eaf75"
  },
  {
    "url": "public/midi/pat/arachno-92.pat",
    "revision": "ecf63195674b1ccf0172fef69af43d6b"
  },
  {
    "url": "public/midi/pat/arachno-93.pat",
    "revision": "5fe5bc7ef1879d38c0baf59fb1bd19f6"
  },
  {
    "url": "public/midi/pat/arachno-94.pat",
    "revision": "e70f27c97ed7265302db627282011b3c"
  },
  {
    "url": "public/midi/pat/arachno-95.pat",
    "revision": "1dedd7dd39a534bad96db468cd6f46c1"
  },
  {
    "url": "public/midi/pat/arachno-96.pat",
    "revision": "665dd5d07e620b65f23b78f22bba815e"
  },
  {
    "url": "public/midi/pat/arachno-97.pat",
    "revision": "965ee6532eb114d4d2e725130c703c69"
  },
  {
    "url": "public/midi/pat/arachno-98.pat",
    "revision": "166008cb39e7e00522eb7ccd6f5189a7"
  },
  {
    "url": "public/midi/pat/arachno-99.pat",
    "revision": "6c11a9f169c92bc1d3ecc83e28e26de6"
  },
  {
    "url": "public/midi/pat/MT32Drums/mt32drum-0.pat",
    "revision": "809a9600df273b091644e88de98749ca"
  },
  {
    "url": "public/midi/pat/MT32Drums/mt32drum-1.pat",
    "revision": "d05da92a93f2c4af65ca97cae7d9727a"
  },
  {
    "url": "public/midi/pat/MT32Drums/mt32drum-10.pat",
    "revision": "8f05b45aa7f6de45d8bdf4d36ea9f5ef"
  },
  {
    "url": "public/midi/pat/MT32Drums/mt32drum-11.pat",
    "revision": "a46e70ccb6da8e756323926f4a0b970a"
  },
  {
    "url": "public/midi/pat/MT32Drums/mt32drum-12.pat",
    "revision": "9821dc77f43eebed031e9e2f55a54cc9"
  },
  {
    "url": "public/midi/pat/MT32Drums/mt32drum-13.pat",
    "revision": "0e761bc7eed74e185db3354e19ec6ca0"
  },
  {
    "url": "public/midi/pat/MT32Drums/mt32drum-14.pat",
    "revision": "916a69da32ec406861450137aec3a7a3"
  },
  {
    "url": "public/midi/pat/MT32Drums/mt32drum-15.pat",
    "revision": "e601b0289e01e33cd9e6e0e486ae59eb"
  },
  {
    "url": "public/midi/pat/MT32Drums/mt32drum-16.pat",
    "revision": "10637dd7dedb1dfaa94b7228fabff59c"
  },
  {
    "url": "public/midi/pat/MT32Drums/mt32drum-17.pat",
    "revision": "ca53b63871ab7a5ea0678e59e9e75e46"
  },
  {
    "url": "public/midi/pat/MT32Drums/mt32drum-18.pat",
    "revision": "1f7cdd1ad0455735353d956b37cfbbbb"
  },
  {
    "url": "public/midi/pat/MT32Drums/mt32drum-19.pat",
    "revision": "179c97aa919b65c756823f12aedc8112"
  },
  {
    "url": "public/midi/pat/MT32Drums/mt32drum-2.pat",
    "revision": "dd915506f00bd4dbb42d8291c845a2c3"
  },
  {
    "url": "public/midi/pat/MT32Drums/mt32drum-20.pat",
    "revision": "7497799a5e382594689c9f33d6121e94"
  },
  {
    "url": "public/midi/pat/MT32Drums/mt32drum-21.pat",
    "revision": "917b430af8a12a3796729b73fa7aa099"
  },
  {
    "url": "public/midi/pat/MT32Drums/mt32drum-22.pat",
    "revision": "1fef67d2672c244e6ad5605ef0e137f6"
  },
  {
    "url": "public/midi/pat/MT32Drums/mt32drum-23.pat",
    "revision": "ce94793f9a193e7a0f5aa44504cbdb43"
  },
  {
    "url": "public/midi/pat/MT32Drums/mt32drum-24.pat",
    "revision": "c56bda42dae65ebc88e23ad67bd817f7"
  },
  {
    "url": "public/midi/pat/MT32Drums/mt32drum-25.pat",
    "revision": "e070e50dad298531e5d71761cf15373a"
  },
  {
    "url": "public/midi/pat/MT32Drums/mt32drum-26.pat",
    "revision": "0d1412ac60808defc69eafac9aa72301"
  },
  {
    "url": "public/midi/pat/MT32Drums/mt32drum-27.pat",
    "revision": "9d8e499e2b36326fc071f46d8ba2dc41"
  },
  {
    "url": "public/midi/pat/MT32Drums/mt32drum-28.pat",
    "revision": "a17b14d9d6d9b0d1878225abd4befbfd"
  },
  {
    "url": "public/midi/pat/MT32Drums/mt32drum-29.pat",
    "revision": "70f460ad92f9aaedda251a3027b8dcff"
  },
  {
    "url": "public/midi/pat/MT32Drums/mt32drum-3.pat",
    "revision": "48909bb017719783d85d258ec20af957"
  },
  {
    "url": "public/midi/pat/MT32Drums/mt32drum-30.pat",
    "revision": "0a0f07c18d8cfcc1601b5f4679a74d15"
  },
  {
    "url": "public/midi/pat/MT32Drums/mt32drum-31.pat",
    "revision": "8e36cbbccfeb2e1a642aa550d04965f6"
  },
  {
    "url": "public/midi/pat/MT32Drums/mt32drum-32.pat",
    "revision": "a395c155500c3b5242c82cfe261969cb"
  },
  {
    "url": "public/midi/pat/MT32Drums/mt32drum-33.pat",
    "revision": "a7b71edd63aec636fdd4c7d0911af94e"
  },
  {
    "url": "public/midi/pat/MT32Drums/mt32drum-34.pat",
    "revision": "6acbd9eab1ffd3d28641bdb57ef40b07"
  },
  {
    "url": "public/midi/pat/MT32Drums/mt32drum-35.pat",
    "revision": "053be639a52438629c767a6f5e9dbd56"
  },
  {
    "url": "public/midi/pat/MT32Drums/mt32drum-36.pat",
    "revision": "8c7f09aae211628a3bb596d00c0bfc9a"
  },
  {
    "url": "public/midi/pat/MT32Drums/mt32drum-37.pat",
    "revision": "d5d7c155c590ff0a2048790788717d52"
  },
  {
    "url": "public/midi/pat/MT32Drums/mt32drum-38.pat",
    "revision": "e50703afc3959fde6857d09649702f79"
  },
  {
    "url": "public/midi/pat/MT32Drums/mt32drum-39.pat",
    "revision": "d4d8a559f6db0a3b9699125470dccdbd"
  },
  {
    "url": "public/midi/pat/MT32Drums/mt32drum-4.pat",
    "revision": "10a9edd055c3a4c2536c9d08274469af"
  },
  {
    "url": "public/midi/pat/MT32Drums/mt32drum-40.pat",
    "revision": "ef494a522a34bb54595cc0e780e0fe9c"
  },
  {
    "url": "public/midi/pat/MT32Drums/mt32drum-41.pat",
    "revision": "0215c425e4e9c9b11771f9b59903dfb6"
  },
  {
    "url": "public/midi/pat/MT32Drums/mt32drum-42.pat",
    "revision": "db2ec9a81456b17b78e82617a25d6708"
  },
  {
    "url": "public/midi/pat/MT32Drums/mt32drum-43.pat",
    "revision": "be222e02ec7921982bd39ba653878c09"
  },
  {
    "url": "public/midi/pat/MT32Drums/mt32drum-44.pat",
    "revision": "f6c1ca115d9786c0f374a01ad604a8ca"
  },
  {
    "url": "public/midi/pat/MT32Drums/mt32drum-45.pat",
    "revision": "b5efff9e34013cc2a8f8f8140ff98b78"
  },
  {
    "url": "public/midi/pat/MT32Drums/mt32drum-46.pat",
    "revision": "0dd2f8b3e5072b2b24790a95aa7f48dd"
  },
  {
    "url": "public/midi/pat/MT32Drums/mt32drum-5.pat",
    "revision": "0c6fa5666e0e58e5876227673cee3734"
  },
  {
    "url": "public/midi/pat/MT32Drums/mt32drum-6.pat",
    "revision": "b057dc7b503edb719a207290a4d10acd"
  },
  {
    "url": "public/midi/pat/MT32Drums/mt32drum-7.pat",
    "revision": "5cb4f399634fb1661d612a5981455ec6"
  },
  {
    "url": "public/midi/pat/MT32Drums/mt32drum-8.pat",
    "revision": "952313b7c5351fb9bf7d6d4a04c9a2d4"
  },
  {
    "url": "public/midi/pat/MT32Drums/mt32drum-9.pat",
    "revision": "04d41bce709b5bcf679e4f11526d5040"
  },
  {
    "url": "public/midi/README.md",
    "revision": "264b20519c9fa12474de21c2a787a071"
  },
  {
    "url": "public/scythe.zip",
    "revision": "56b74ad8a2820ba5538bfd67d1be2e35"
  },
  {
    "url": "public/silence.mp3",
    "revision": "a27e642e62adec60ba2626b83350e69a"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
