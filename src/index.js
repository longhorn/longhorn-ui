import './publicPath'

// import assets
import './assets/iconfont/iconfont.eot'
import './assets/iconfont/iconfont.svg'
import './assets/iconfont/iconfont.ttf'
import './assets/iconfont/iconfont.woff'

// import global styles
import './assets/styles/index.less'

import app from './main'
import './index.html'

// 2. Model
app.model(require('./models/app'))

// 3. Router
app.router(require('./router'))

// 4. Start
app.start('#root')
