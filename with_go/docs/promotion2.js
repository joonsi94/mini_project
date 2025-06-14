const supabase = window.supabase.createClient(
    'https://zgrjjnifqoactpuqolao.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpncmpqbmlmcW9hY3RwdXFvbGFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyNDc0NTgsImV4cCI6MjA1NjgyMzQ1OH0._Vl-6CRKdMjeDRyNoxlfect7sgusZ7L0N5OYu0a5hT0'
);

document.addEventListener("DOMContentLoaded", async function () {

    await Promise.all([
        fetch("header.html")
            .then(res => res.text())
            .then(data => {
                const header = document.getElementById("header");
                if (header) header.innerHTML = data;
            }),
        fetch("footer.html")
            .then(res => res.text())
            .then(data => {
                const footer = document.getElementById("footer");
                if (footer) footer.innerHTML = data;
            })
    ]);


    const eventList = document.querySelector(".event-list");
    if (!eventList) {
        console.error("event-list를 찾을 수 없습니다!");
    } else {
        const { data: events, error } = await supabase
            .from("withgo_event")
            .select("*")
            .order("date", { ascending: true });

        if (error) {
            console.error("Supabase에서 이벤트 불러오기 실패:", error);
        } else {
            events.forEach(event => {
                const eventItem = document.createElement("div");
                eventItem.classList.add("event-item");
                eventItem.innerHTML = `
                <a href="${event.link_url}" target="_blank" class="event-link">
                  <img src="${event.img_url}" alt="${event.title}" />
                  <div class="event-text">
                    <h3>${event.title}</h3>
                    <p>${event.date}</p>
                  </div>
                </a>
              `;
                eventList.appendChild(eventItem);
            });
        }
    }


    const tabs = document.querySelectorAll(".tab_btn ul li a");
    const contents = document.querySelectorAll(".tab_content");

    if (tabs.length > 0 && contents.length > 0) {
        tabs[0].classList.add("on");
        contents[0].classList.add("active");
        contents[0].style.opacity = "1";

        tabs.forEach(tab => {
            tab.addEventListener("click", function (e) {
                e.preventDefault();

                tabs.forEach(t => t.classList.remove("on"));
                this.classList.add("on");

                contents.forEach(content => {
                    content.classList.remove("active");
                    content.style.opacity = "0.3";
                });

                const targetContent = document.querySelector(`#${this.dataset.tab}`);
                if (targetContent) {
                    targetContent.classList.add("active");
                    targetContent.style.opacity = "1";
                }
            });
        });
    }


    const dropdown = document.querySelector(".dropdown");
    const dropdownList = document.querySelector(".dropdown-list");

    if (dropdown && dropdownList) {
        dropdown.addEventListener("click", function () {
            dropdownList.classList.toggle("show");
        });

        dropdownList.querySelectorAll("li").forEach(item => {
            item.addEventListener("click", function () {
                dropdown.querySelector("span").textContent = this.textContent;
                dropdownList.classList.remove("show");
            });
        });

        window.addEventListener("click", function (e) {
            if (!dropdown.contains(e.target)) {
                dropdownList.classList.remove("show");
            }
        });
    }
});
