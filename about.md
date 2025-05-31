---
layout: about
title: "About Us"
permalink: /about/
---

<div class="intro">
We are a group of six friends who are using this blog to share our love for thinking broadly about problems and questions in science and medicine. We wrote the below bios for each other!
</div>

<div class="author-container">
    {% for author in site.data.authors %}
    <div class="author-row" id="{{ author[1].name | slugify }}">
        <div class="author-card">
            <img src="{{ site.baseurl }}/assets/images/{{ author[1].image }}" alt="{{ author[1].name }}">
            <h4>{{ author[1].name }}</h4>
            {% if author[1].website or author[1].twitter or author[1].github or author[1].linkedin %}
            <div class="social-icons">
                {% if author[1].website %}
                <a href="{{ author[1].website }}" class="social-icon" target="_blank" title="Personal Website">
                    <i class="fas fa-globe"></i>
                </a>
                {% endif %}
                
                {% if author[1].twitter %}
                <a href="https://twitter.com/{{ author[1].twitter }}" class="social-icon" target="_blank" title="Twitter">
                    <i class="fab fa-twitter"></i>
                </a>
                {% endif %}
                
                {% if author[1].github %}
                <a href="https://github.com/{{ author[1].github }}" class="social-icon" target="_blank" title="GitHub">
                    <i class="fab fa-github"></i>
                </a>
                {% endif %}
                
                {% if author[1].linkedin %}
                <a href="{{ author[1].linkedin }}" class="social-icon" target="_blank" title="LinkedIn">
                    <i class="fab fa-linkedin"></i>
                </a>
                {% endif %}

                {% if author[1].scholar %}
                <a href="https://scholar.google.com/citations?user={{ author[1].scholar }}" class="social-icon" target="_blank" title="Google Scholar">
                    <i class="fas fa-graduation-cap"></i>
                </a>
                {% endif %}
            </div>
            {% endif %}
        </div>
        <div class="bio">
            <div class="bio-content">
                {{ author[1].bio }}
            </div>
            <p class="bio-credit">– Written by {{ author[1].bio_author }}</p>
        </div>
    </div>
    {% endfor %}
</div>
