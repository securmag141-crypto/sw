const { createApp } = Vue;

// Конфиг Firebase (замени на свой из консоли firebase.google.com)
const firebaseConfig = {
    apiKey: "AIzaSyBtjMpioD3Mw3Fgvn833K0q1fr8mCZ-70k",
    authDomain: "swws-cd91c.firebaseapp.com",
    projectId: "swws-cd91c",
    storageBucket: "swws-cd91c.firebasestorage.app",
    messagingSenderId: "557013608102",
    appId: "1:557013608102:web:78e9f214d8bea34728b667"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

createApp({
    data() {
        return {
            login: '',
            password: '',
            error: '',
            user: null,
            userRole: 'guard',
            newData: '',
            dataList: []
        }
    },
    mounted() {
        auth.onAuthStateChanged(user => {
            this.user = user;
            if (user) {
                this.loadUserRole(user.uid);
                this.loadData();
            }
        });
    },
    methods: {
        async signIn() {
            try {
                await auth.signInWithEmailAndPassword(this.login, this.password);
                this.error = '';
            } catch (err) {
                this.error = 'Ошибка: ' + err.message;
            }
        },
        async signOut() {
            await auth.signOut();
        },
        async loadUserRole(uid) {
            const doc = await db.collection('users').doc(uid).get();
            if (doc.exists) {
                this.userRole = doc.data().role || 'guard';
            } else {
                this.userRole = 'guard';
            }
        },
        async loadData() {
            const snapshot = await db.collection('posts').orderBy('createdAt').get();
            this.dataList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        },
        async addData() {
            if (this.userRole !== 'admin') {
                alert('Только старший смены может добавлять данные');
                return;
            }
            
            if (!this.newData.trim()) return;
            
            await db.collection('posts').add({
                text: this.newData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                author: this.user.email
            });
            
            this.newData = '';
            this.loadData();
        },
        async deleteData(postId) {
            if (this.userRole !== 'admin') return;
            
            if (!confirm('Удалить запись?')) return;
            
            await db.collection('posts').doc(postId).delete();
            this.loadData();
        }
    }
}).mount('#app');
